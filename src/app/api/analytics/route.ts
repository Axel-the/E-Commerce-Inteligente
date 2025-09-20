import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y
    const type = searchParams.get('type') || 'overview' // overview, predictions, products, customers

    // Get orders data
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }

    // Fetch sales data
    const orders = await db.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    })

    // Fetch all products for analysis
    const products = await db.product.findMany({
      include: {
        category: true,
        reviews: true,
        orderItems: true
      }
    })

    // Fetch users data
    const users = await db.user.findMany({
      include: {
        orders: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      }
    })

    // Calculate basic metrics
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0
    const totalCustomers = orders.length > 0 ? new Set(orders.map(o => o.userId)).size : 0

    // Calculate product performance
    const productSales = products.map(product => {
      const productOrderItems = product.orderItems.filter(oi => {
        const order = orders.find(o => o.id === oi.orderId)
        return order && order.createdAt >= startDate && order.createdAt <= endDate
      })
      
      const quantitySold = productOrderItems.reduce((sum, oi) => sum + oi.quantity, 0)
      const revenue = productOrderItems.reduce((sum, oi) => sum + (oi.price * oi.quantity), 0)
      
      return {
        id: product.id,
        name: product.name,
        category: product.category.name,
        price: product.price,
        stock: product.stock,
        quantitySold,
        revenue,
        avgRating: product.reviews.length > 0 
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length 
          : 0,
        reviewCount: product.reviews.length
      }
    }).filter(p => p.quantitySold > 0).sort((a, b) => b.revenue - a.revenue)

    // Calculate daily sales for trends
    const dailySales = []
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate.toDateString() === d.toDateString()
      })
      
      const daySales = dayOrders.reduce((sum, order) => sum + order.total, 0)
      const dayOrdersCount = dayOrders.length
      
      dailySales.push({
        date: new Date(d).toISOString().split('T')[0],
        sales: daySales,
        orders: dayOrdersCount
      })
    }

    // Calculate category performance
    const categorySales = products.reduce((acc, product) => {
      const category = product.category.name
      if (!acc[category]) {
        acc[category] = {
          category,
          revenue: 0,
          quantity: 0,
          products: 0
        }
      }
      
      const productSalesData = productSales.find(p => p.id === product.id)
      if (productSalesData) {
        acc[category].revenue += productSalesData.revenue
        acc[category].quantity += productSalesData.quantitySold
        acc[category].products += 1
      }
      
      return acc
    }, {} as Record<string, any>)

    const categoryPerformance = Object.values(categorySales).sort((a: any, b: any) => b.revenue - a.revenue)

    // Create AI instance for predictions
    const zai = await ZAI.create()

    let aiInsights = {}
    let predictions = {}

    if (type === 'predictions' || type === 'overview') {
      try {
        // Prepare data for AI analysis
        const analysisData = {
          period,
          metrics: {
            totalSales,
            totalOrders,
            avgOrderValue,
            totalCustomers
          },
          dailySales: dailySales.slice(-14), // Last 14 days for trend analysis
          topProducts: productSales.slice(0, 10),
          categoryPerformance: categoryPerformance.slice(0, 5)
        }

        // Generate AI insights and predictions
        const prompt = `Analiza los siguientes datos de ventas de e-commerce y proporciona insights predictivos:

Período de análisis: ${period}
Métricas clave:
- Ventas totales: ${analysisData.metrics.totalSales.toFixed(2)}€
- Total de pedidos: ${analysisData.metrics.totalOrders}
- Valor promedio de pedido: ${analysisData.metrics.avgOrderValue.toFixed(2)}€
- Clientes únicos: ${analysisData.metrics.totalCustomers}

Tendencia diaria (últimos 14 días):
${analysisData.dailySales.map(d => `${d.date}: ${d.sales.toFixed(2)}€ (${d.orders} pedidos)`).join('\n')}

Top 5 productos:
${analysisData.topProducts.slice(0, 5).map(p => `${p.name}: ${p.revenue.toFixed(2)}€ (${p.quantitySold} unidades)`).join('\n')}

Top 5 categorías:
${analysisData.categoryPerformance.slice(0, 5).map((c: any) => `${c.category}: ${c.revenue.toFixed(2)}€ (${c.quantity} unidades)`).join('\n')}

Proporciona:
1. Análisis de tendencias y patrones
2. Predicciones de ventas para los próximos 30 días
3. Recomendaciones estratégicas
4. Identificación de oportunidades y riesgos
5. Insights sobre comportamiento del cliente

Responde en formato JSON con las siguientes claves:
- trends: array de strings con análisis de tendencias
- predictions: objeto con predicciones numéricas
- recommendations: array de strings con recomendaciones
- opportunities: array de strings con oportunidades
- risks: array de strings con riesgos identificados`

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en análisis de datos de e-commerce y business intelligence. Proporciona insights precisos y accionables basados en datos.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1200
        })

        const aiResponse = completion.choices[0]?.message?.content
        try {
          aiInsights = JSON.parse(aiResponse || '{}')
        } catch (parseError) {
          console.error('Error parsing AI insights:', parseError)
          // Fallback insights
          aiInsights = {
            trends: ['Análisis no disponible'],
            predictions: { next30Days: totalSales * 1.1 },
            recommendations: ['Continuar monitoreando las ventas'],
            opportunities: ['Oportunidades no identificadas'],
            risks: ['Riesgos no identificados']
          }
        }

        // Generate specific predictions
        predictions = {
          next30Days: {
            sales: totalSales * 1.15, // 15% growth prediction
            orders: Math.round(totalOrders * 1.12),
            avgOrderValue: avgOrderValue * 1.02,
            customers: Math.round(totalCustomers * 1.18)
          },
          topGrowingProducts: productSales
            .sort((a, b) => (b.revenue / b.price) - (a.revenue / a.price))
            .slice(0, 3)
            .map(p => ({ id: p.id, name: p.name, growthRate: 1.2 })),
          seasonalTrends: detectSeasonalTrends(dailySales)
        }

      } catch (error) {
        console.error('Error generating AI insights:', error)
      }
    }

    // Save sales data to database for historical tracking
    try {
      await db.salesData.create({
        data: {
          date: endDate,
          totalSales,
          totalOrders,
          avgOrderValue,
          topProducts: JSON.stringify(productSales.slice(0, 10).map(p => p.id))
        }
      })
    } catch (error) {
      console.error('Error saving sales data:', error)
    }

    const response = {
      period,
      overview: {
        totalSales,
        totalOrders,
        avgOrderValue,
        totalCustomers
      },
      dailySales,
      productPerformance: productSales,
      categoryPerformance,
      aiInsights,
      predictions,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error generating analytics:', error)
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    )
  }
}

// Helper function to detect seasonal trends
function detectSeasonalTrends(dailySales: any[]) {
  // Simple trend detection - in real implementation, this would be more sophisticated
  const recentSales = dailySales.slice(-7)
  const olderSales = dailySales.slice(-14, -7)
  
  const recentAvg = recentSales.reduce((sum, d) => sum + d.sales, 0) / recentSales.length
  const olderAvg = olderSales.length > 0 ? olderSales.reduce((sum, d) => sum + d.sales, 0) / olderSales.length : recentAvg
  
  const trend = recentAvg > olderAvg ? 'upward' : recentAvg < olderAvg ? 'downward' : 'stable'
  
  return {
    direction: trend,
    changePercentage: olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0,
    recentAverage: recentAvg,
    olderAverage: olderAvg
  }
}