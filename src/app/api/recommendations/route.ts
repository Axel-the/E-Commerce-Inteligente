import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { userId, productId, type = 'PERSONALIZED' } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user's order history and preferences
    const userOrders = await db.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                reviews: true
              }
            }
          }
        }
      }
    })

    // Get all products for recommendations from database
    const allProducts = await db.product.findMany({
      include: {
        category: true,
        reviews: true
      },
      where: { isActive: true }
    })

    // Create AI instance
    const zai = await ZAI.create()

    // Prepare user data for AI analysis
    const userData = {
      userId,
      orderHistory: userOrders.map(order => ({
        id: order.id,
        items: order.items.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          category: item.product.category.name,
          price: item.price,
          quantity: item.quantity
        }))
      })),
      preferences: userOrders.flatMap(order => 
        order.items.map(item => item.product.category.name)
      ).reduce((acc, category) => {
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    // Prepare product data for AI analysis
    const productData = allProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category.name,
      stock: product.stock,
      avgRating: product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
        : 0,
      reviewCount: product.reviews.length
    }))

    // Calculate some statistics for better recommendations
    const mostExpensive = productData.reduce((max, p) => p.price > max.price ? p : max)
    const leastExpensive = productData.reduce((min, p) => p.price < min.price ? p : min)
    const highestRated = productData.reduce((max, p) => p.avgRating > max.avgRating ? p : max)
    const mostReviewed = productData.reduce((max, p) => p.reviewCount > max.reviewCount ? p : max)

    // Create prompt for AI based on recommendation type
    let prompt = ''
    
    switch (type) {
      case 'SIMILAR_PRODUCTS':
        if (productId) {
          const currentProduct = productData.find(p => p.id === productId)
          prompt = `Basado en el siguiente producto, recomienda 5 productos similares. Considera categoría, rango de precio y características.

Producto Actual:
- Nombre: ${currentProduct?.name}
- Categoría: ${currentProduct?.category}
- Precio: ${currentProduct?.price}
- Descripción: ${currentProduct?.description}

Productos Disponibles:
${productData.filter(p => p.id !== productId).map(p => 
  `- ID: ${p.id}, Nombre: ${p.name}, Categoría: ${p.category}, Precio: ${p.price}, Rating: ${p.avgRating}`
).join('\n')}

Devuelve un array JSON de IDs de productos recomendados con puntuaciones (0-1) y razones.`
        }
        break

      case 'FREQUENTLY_BOUGHT_TOGETHER':
        if (productId) {
          prompt = `Basado en patrones de compra, recomienda 5 productos que frecuentemente se compran juntos con el siguiente producto:

Producto Objetivo:
- Nombre: ${productData.find(p => p.id === productId)?.name}
- Categoría: ${productData.find(p => p.id === productId)?.category}

Patrones de Compra del Usuario:
${JSON.stringify(userData.orderHistory, null, 2)}

Productos Disponibles:
${productData.filter(p => p.id !== productId).map(p => 
  `- ID: ${p.id}, Nombre: ${p.name}, Categoría: ${p.category}, Precio: ${p.price}`
).join('\n')}

Devuelve un array JSON de IDs de productos recomendados con puntuaciones (0-1) y razones.`
        }
        break

      case 'TRENDING':
        prompt = `Analiza los siguientes datos de productos y recomienda 5 productos trending basados en popularidad, calificaciones y demanda reciente.

Productos Disponibles:
${productData.map(p => 
  `- ID: ${p.id}, Nombre: ${p.name}, Categoría: ${p.category}, Precio: ${p.price}, Rating: ${p.avgRating}, Reseñas: ${p.reviewCount}, Stock: ${p.stock}`
).join('\n')}

Considera productos con altas calificaciones, buen número de reseñas y niveles de stock razonables como trending.

Producto más caro: ${mostExpensive.name} (${mostExpensive.price}€)
Producto más barato: ${leastExpensive.name} (${leastExpensive.price}€)
Producto mejor calificado: ${highestRated.name} (${highestRated.avgRating}/5)
Producto más reseñado: ${mostReviewed.name} (${mostReviewed.reviewCount} reseñas)

Devuelve un array JSON de IDs de productos recomendados con puntuaciones (0-1) y razones.`
        break

      case 'CATEGORY_BASED':
        const userCategories = Object.keys(userData.preferences)
        if (userCategories.length > 0) {
          prompt = `Basado en las preferencias de categoría del usuario, recomienda 5 productos de sus categorías favoritas.

Preferencias de Categoría del Usuario:
${userCategories.map(cat => `- ${cat}: ${userData.preferences[cat]} compras`).join('\n')}

Productos Disponibles:
${productData.map(p => 
  `- ID: ${p.id}, Nombre: ${p.name}, Categoría: ${p.category}, Precio: ${p.price}, Rating: ${p.avgRating}`
).join('\n')}

Devuelve un array JSON de IDs de productos recomendados con puntuaciones (0-1) y razones.`
        }
        break

      default: // PERSONALIZED
        prompt = `Basado en el historial de compras y preferencias del usuario, proporciona 5 recomendaciones de productos personalizadas.

Perfil del Usuario:
${JSON.stringify(userData, null, 2)}

Productos Disponibles:
${productData.map(p => 
  `- ID: ${p.id}, Nombre: ${p.name}, Categoría: ${p.category}, Precio: ${p.price}, Rating: ${p.avgRating}`
).join('\n')}

Considera los patrones de compra, categorías preferidas y sensibilidad de precio del usuario al hacer recomendaciones.

Estadísticas Importantes:
- Producto más caro: ${mostExpensive.name} (${mostExpensive.price}€)
- Producto más barato: ${leastExpensive.name} (${leastExpensive.price}€)
- Producto mejor calificado: ${highestRated.name} (${highestRated.avgRating}/5)
- Producto más reseñado: ${mostReviewed.name} (${mostReviewed.reviewCount} reseñas)

Devuelve un array JSON de IDs de productos recomendados con puntuaciones (0-1) y razones.`
    }

    // Get AI recommendations
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un sistema experto de recomendaciones de e-commerce. Analiza el comportamiento del usuario y los datos de productos para proporcionar recomendaciones personalizadas. Devuelve solo arrays JSON válidos con IDs de productos, puntuaciones y razones.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    // Parse AI response
    const aiResponse = completion.choices[0]?.message?.content
    let recommendations = []

    try {
      recommendations = JSON.parse(aiResponse || '[]')
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      // Fallback to basic recommendations based on ratings
      recommendations = productData
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 5)
        .map(p => ({
          productId: p.id,
          score: 0.8,
          reason: 'Producto popular con buenas calificaciones'
        }))
    }

    // Save recommendations to database
    await db.recommendation.deleteMany({
      where: { userId, type }
    })

    for (const rec of recommendations) {
      if (rec.productId && rec.score !== undefined) {
        await db.recommendation.create({
          data: {
            userId,
            productId: rec.productId,
            score: rec.score,
            reason: rec.reason || 'Recomendación IA',
            type
          }
        })
      }
    }

    // Get full product details for recommendations
    const recommendedProducts = await db.product.findMany({
      where: {
        id: {
          in: recommendations.map(r => r.productId).filter(Boolean)
        }
      },
      include: {
        category: true,
        reviews: true
      }
    })

    // Combine with AI scores and reasons
    const enrichedRecommendations = recommendedProducts.map(product => {
      const aiRec = recommendations.find(r => r.productId === product.id)
      return {
        ...product,
        score: aiRec?.score || 0,
        reason: aiRec?.reason || 'Recomendación IA'
      }
    })

    return NextResponse.json({
      recommendations: enrichedRecommendations,
      type,
      userId
    })

  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') || 'PERSONALIZED'

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get existing recommendations from database
    const recommendations = await db.recommendation.findMany({
      where: { userId, type },
      include: {
        product: {
          include: {
            category: true,
            reviews: true
          }
        }
      },
      orderBy: { score: 'desc' },
      take: 10
    })

    // If no recommendations exist, generate new ones
    if (recommendations.length === 0) {
      const newRecommendations = await fetch(`${request.nextUrl.origin}/api/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type })
      })

      if (newRecommendations.ok) {
        const data = await newRecommendations.json()
        return NextResponse.json(data)
      }
    }

    return NextResponse.json({
      recommendations: recommendations.map(r => ({
        ...r.product,
        score: r.score,
        reason: r.reason
      })),
      type,
      userId
    })

  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}