import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// Datos de productos de ejemplo para el chatbot (como fallback)
const fallbackProducts = [
  {
    id: '1',
    name: 'MacBook Pro 16"',
    description: 'Potente laptop con chip M2 Pro, ideal para profesionales y creadores',
    price: 9999.99,
    stock: 15,
    category: 'Laptops',
    rating: 4.8,
    reviewCount: 156
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    description: 'El smartphone más avanzado con cámara profesional y titanio',
    price: 4799.99,
    stock: 25,
    category: 'Smartphones',
    rating: 4.9,
    reviewCount: 289
  },
  {
    id: '3',
    name: 'AirPods Pro 2',
    description: 'Auriculares inalámbricos con cancelación activa de ruido',
    price: 999.99,
    stock: 50,
    category: 'Audio',
    rating: 4.7,
    reviewCount: 342
  },
  {
    id: '4',
    name: 'Apple Watch Ultra 2',
    description: 'Smartwatch resistente para deportes extremos y aventuras',
    price: 3199.99,
    stock: 30,
    category: 'Wearables',
    rating: 4.6,
    reviewCount: 198
  },
  {
    id: '5',
    name: 'iPad Pro 12.9"',
    description: 'Tablet profesional con chip M2 y pantalla Liquid Retina XDR',
    price: 4399.99,
    stock: 20,
    category: 'Tablets',
    rating: 4.8,
    reviewCount: 167
  },
  {
    id: '6',
    name: 'Sony Alpha 7R V',
    description: 'Cámara mirrorless full-frame de 61MP para fotografía profesional',
    price: 15599.99,
    stock: 10,
    category: 'Cámaras',
    rating: 4.9,
    reviewCount: 89
  },
  {
    id: '7',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Smartphone Android premium con S Pen y cámara de 200MP',
    price: 5199.99,
    stock: 18,
    category: 'Smartphones',
    rating: 4.7,
    reviewCount: 234
  },
  {
    id: '8',
    name: 'Dell XPS 15',
    description: 'Laptop de alto rendimiento para creadores y gamers',
    price: 7599.99,
    stock: 12,
    category: 'Laptops',
    rating: 4.5,
    reviewCount: 143
  },
  {
    id: '9',
    name: 'Xiaomi Redmi Note 13',
    description: 'Smartphone con excelente relación calidad-precio para el mercado peruano',
    price: 1299.99,
    stock: 45,
    category: 'Smartphones',
    rating: 4.4,
    reviewCount: 567
  },
  {
    id: '10',
    name: 'Lenovo IdeaPad 3',
    description: 'Laptop ideal para estudiantes y trabajo remoto en Perú',
    price: 2499.99,
    stock: 30,
    category: 'Laptops',
    rating: 4.3,
    reviewCount: 234
  },
  {
    id: '11',
    name: 'JBL Flip 6',
    description: 'Bocina portátil Bluetooth resistente al agua',
    price: 399.99,
    stock: 60,
    category: 'Audio',
    rating: 4.6,
    reviewCount: 445
  },
  {
    id: '12',
    name: 'Huawei Band 8',
    description: 'Smartband fitness con monitor de salud y batería de larga duración',
    price: 299.99,
    stock: 80,
    category: 'Wearables',
    rating: 4.5,
    reviewCount: 678
  }
]

export async function POST(request: NextRequest) {
  try {
    const { message, userId, conversationHistory = [] } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Create AI instance
    const zai = await ZAI.create()

    // Get user information if userId is provided
    let userInfo = {}
    let userOrders = []
    
    if (userId && userId !== 'guest') {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          orders: {
            include: {
              items: {
                include: {
                  product: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      })

      if (user) {
        userInfo = {
          name: user.name,
          email: user.email
        }
        userOrders = user.orders
      }
    }

    // Try to get products from database, fallback to sample data
    let productsFromDB = []
    try {
      productsFromDB = await db.product.findMany({
        include: {
          category: true,
          reviews: true
        },
        where: { isActive: true }
      })
    } catch (error) {
      console.error('Error fetching products from database:', error)
    }

    // Use database products if available, otherwise fallback to sample data
    const products = productsFromDB.length > 0 ? productsFromDB : fallbackProducts
    const sampleProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category.name || p.category,
      rating: p.reviews && p.reviews.length > 0 
        ? p.reviews.reduce((sum, review) => sum + review.rating, 0) / p.reviews.length 
        : (p.rating || 0),
      reviewCount: p.reviews?.length || p.reviewCount || 0
    }))

    // Analyze the message to determine if it's a product-related question
    const lowerMessage = message.toLowerCase()
    
    // Check for specific product questions
    const isProductQuestion = 
      lowerMessage.includes('más vendido') || 
      lowerMessage.includes('más caro') || 
      lowerMessage.includes('más barato') || 
      lowerMessage.includes('mejor calificado') || 
      lowerMessage.includes('productos') || 
      lowerMessage.includes('recomienda') ||
      lowerMessage.includes('cuántos') ||
      lowerMessage.includes('qué tienes') ||
      lowerMessage.includes('disponible') ||
      lowerMessage.includes('stock') ||
      lowerMessage.includes('precio') ||
      lowerMessage.includes('cuesta') ||
      lowerMessage.includes('vale') ||
      lowerMessage.includes('calificación') ||
      lowerMessage.includes('rating') ||
      lowerMessage.includes('reseñas') ||
      lowerMessage.includes('reviews') ||
      lowerMessage.includes('categoría') ||
      lowerMessage.includes('marca') ||
      lowerMessage.includes('envío') ||
      lowerMessage.includes('envian') ||
      lowerMessage.includes('gratis') ||
      lowerMessage.includes('perú') ||
      lowerMessage.includes('lima') ||
      lowerMessage.includes('garantía') ||
      lowerMessage.includes('oferta') ||
      lowerMessage.includes('descuento') ||
      lowerMessage.includes('promoción') ||
      lowerMessage.includes('pago') ||
      lowerMessage.includes('cuotas') ||
      lowerMessage.includes('crédito') ||
      lowerMessage.includes('tarjeta') ||
      lowerMessage.includes('estudiantes') ||
      lowerMessage.includes('universitarios') ||
      lowerMessage.includes('trabajo') ||
      lowerMessage.includes('oficina') ||
      lowerMessage.includes('gaming') ||
      lowerMessage.includes('juegos')

    let productContext = ''
    if (isProductQuestion) {
      // Generate product insights based on the actual data
      const mostExpensive = sampleProducts.reduce((max, p) => p.price > max.price ? p : max)
      const leastExpensive = sampleProducts.reduce((min, p) => p.price < min.price ? p : min)
      const highestRated = sampleProducts.reduce((max, p) => p.rating > max.rating ? p : max)
      const mostReviewed = sampleProducts.reduce((max, p) => p.reviewCount > max.reviewCount ? p : max)
      
      const categories = [...new Set(sampleProducts.map(p => p.category))]
      const categoryCounts = sampleProducts.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const totalProducts = sampleProducts.length
      const totalStock = sampleProducts.reduce((sum, p) => sum + p.stock, 0)
      const averagePrice = sampleProducts.reduce((sum, p) => sum + p.price, 0) / totalProducts
      const averageRating = sampleProducts.reduce((sum, p) => sum + p.rating, 0) / totalProducts

      productContext = `

CATÁLOGO DE PRODUCTOS ACTUAL:
Total de productos: ${totalProducts}
Stock total: ${totalStock} unidades
Precio promedio: S/${averagePrice.toFixed(2)}
Calificación promedio: ${averageRating.toFixed(1)}/5

PRODUCTOS DESTACADOS:
- Más caro: ${mostExpensive.name} (S/${mostExpensive.price.toFixed(2)})
- Más barato: ${leastExpensive.name} (S/${leastExpensive.price.toFixed(2)})
- Mejor calificado: ${highestRated.name} (${highestRated.rating}/5, ${highestRated.reviewCount} reseñas)
- Más reseñado: ${mostReviewed.name} (${mostReviewed.reviewCount} reseñas)

CATEGORÍAS DISPONIBLES:
${categories.map(cat => `- ${cat}: ${categoryCounts[cat]} productos`).join('\n')}

LISTA COMPLETA DE PRODUCTOS:
${sampleProducts.map(p => `- ${p.name}: S/${p.price.toFixed(2)}, Stock: ${p.stock}, Calificación: ${p.rating}/5 (${p.reviewCount} reseñas), Categoría: ${p.category}`).join('\n')}

INFORMACIÓN DE ENVÍO Y PAGO PARA PERÚ:
- Envío a todo Perú: 2-5 días hábiles
- Envío gratis en pedidos mayores a S/200
- Opciones de pago: Tarjeta de crédito/débito, cuotas sin interés, Yape, Plin, transferencia
- Cuotas disponibles: Hasta 12 cuotas sin interés con tarjetas participantes
- Garantía oficial: 1-2 años según producto
- Devoluciones: 30 días para devoluciones en estado original
- Soporte técnico: Atención en español, soporte local
- Horario de atención: 24/7 para consultas online
`
    }

    // Get recent chat history for context
    const recentHistory = conversationHistory.slice(-6) // Last 6 messages for context

    // Create system prompt based on user context
    let systemPrompt = `Eres un asistente de servicio al cliente experto para TechStore Perú, una plataforma de e-commerce de tecnología premium en Perú. 

Tu personalidad:
- Amigable, profesional y servicial
- Conocedor sobre productos, especificaciones técnicas, precios en Soles Peruanos y disponibilidad
- Proactivo en ofrecer ayuda y recomendaciones personalizadas
- Capaz de manejar múltiples idiomas (responde en el mismo idioma del usuario)
- Siempre honesto sobre la disponibilidad y especificaciones
- Especializado en el mercado peruano y sus necesidades

Tus responsabilidades:
- Responder preguntas sobre productos, precios en Soles (S/), stock y especificaciones
- Proporcionar recomendaciones basadas en las necesidades del cliente peruano
- Ayudar con comparaciones entre productos
- Ofrecer información sobre envíos a todo Perú, devoluciones y garantías
- Resolver problemas y quejas de manera empática
- Escalar problemas complejos a agentes humanos cuando sea necesario

Información de la empresa:
- Nombre: TechStore Perú
- Especialidad: Tecnología premium (laptops, smartphones, audio, wearables, cámaras, tablets)
- Moneda: Soles Peruanos (S/)
- Política de devoluciones: 30 días para devoluciones
- Tiempo de envío: 2-5 días hábiles a todo Perú
- Contacto: support@techstoreperu.com, +51 912 345 678
- Horario de atención: 24/7 (eres un bot)

REGLAS IMPORTANTES:
1. Siempre basa tus respuestas en los datos de productos proporcionados
2. Nunca inventes precios o especificaciones que no estén en los datos
3. Si un producto está agotado, menciona claramente que no hay stock
4. Para preguntas sobre productos, usa la información del catálogo actual
5. Sé específico y da detalles precisos
6. Ofrece alternativas si un producto no está disponible
7. Mantén un tono conversacional pero profesional
8. Menciona siempre los precios en Soles Peruanos (S/)${productContext}`

    // Add user context if available
    if (Object.keys(userInfo).length > 0) {
      systemPrompt += `\n\nInformación del usuario actual:\n- Nombre: ${userInfo.name || 'No especificado'}\n- Email: ${userInfo.email || 'No especificado'}`
    }

    if (userOrders.length > 0) {
      systemPrompt += `\n\nPedidos recientes del usuario:`
      userOrders.forEach((order, index) => {
        systemPrompt += `\n- Pedido ${order.id}: Estado ${order.status}, Total: S/${order.total}, Items: ${order.items.length}`
      })
    }

    // Prepare conversation history for AI
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ]

    // Add conversation history
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.message
      })
    })

    // Add current message
    messages.push({
      role: 'user',
      content: message
    })

    // Get AI response
    const completion = await zai.chat.completions.create({
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 800
    })

    const aiResponse = completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje. Por favor, intenta de nuevo.'

    // Save chat message to database if userId is provided
    if (userId && userId !== 'guest') {
      try {
        await db.chatMessage.create({
          data: {
            userId: userId,
            message: message,
            response: aiResponse,
            isBot: true
          }
        })
      } catch (error) {
        console.error('Error saving chat message:', error)
      }
    }

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in chatbot API:', error)
    
    // Fallback response with basic product information
    const fallbackResponse = `Lo siento, estoy experimentando dificultades técnicas en este momento. 

Sin embargo, puedo darte alguna información básica:

**Productos destacados:**
- MacBook Pro 16": S/9,999.99 (4.8/5 estrellas)
- iPhone 15 Pro: S/4,799.99 (4.9/5 estrellas)
- Sony Alpha 7R V: S/15,599.99 (4.9/5 estrellas)

Para ayuda adicional, contacta a nuestro equipo:
- Email: support@techstoreperu.com
- Teléfono: +51 912 345 678

Agradecemos tu paciencia y comprensión.`

    return NextResponse.json({
      response: fallbackResponse,
      timestamp: new Date().toISOString()
    })
  }
}

// GET endpoint to retrieve chat history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId || userId === 'guest') {
      return NextResponse.json({ messages: [] })
    }

    const messages = await db.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Last 50 messages
    })

    return NextResponse.json({
      messages: messages.reverse().map(msg => ({
        id: msg.id,
        message: msg.message,
        response: msg.response,
        isBot: msg.isBot,
        timestamp: msg.createdAt
      }))
    })

  } catch (error) {
    console.error('Error fetching chat history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
}