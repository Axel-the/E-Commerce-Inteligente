import { db } from './db'

async function main() {
  console.log('Seeding database...')

  // Create categories
  const categories = await Promise.all([
    db.category.create({
      data: {
        name: 'Laptops',
        description: 'Laptops y notebooks de alto rendimiento',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'
      }
    }),
    db.category.create({
      data: {
        name: 'Smartphones',
        description: 'Teléfonos inteligentes de última generación',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'
      }
    }),
    db.category.create({
      data: {
        name: 'Audio',
        description: 'Auriculares y equipos de audio premium',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
      }
    }),
    db.category.create({
      data: {
        name: 'Wearables',
        description: 'Smartwatches y dispositivos vestibles',
        image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400'
      }
    }),
    db.category.create({
      data: {
        name: 'Tablets',
        description: 'Tablets y dispositivos móviles',
        image: 'https://images.unsplash.com/photo-1561154464-30e247f54313?w=400'
      }
    }),
    db.category.create({
      data: {
        name: 'Cámaras',
        description: 'Cámaras fotográficas y accesorios',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400'
      }
    })
  ])

  // Create products
  const products = await Promise.all([
    db.product.create({
      data: {
        name: 'MacBook Pro 16"',
        description: 'Potente laptop con chip M2 Pro, ideal para profesionales y creadores',
        price: 2499.99,
        image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
        stock: 15,
        sku: 'MBP16-M2-2023',
        categoryId: categories[0].id
      }
    }),
    db.product.create({
      data: {
        name: 'iPhone 15 Pro',
        description: 'El smartphone más avanzado con cámara profesional y titanio',
        price: 1199.99,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
        stock: 25,
        sku: 'IP15PRO-256',
        categoryId: categories[1].id
      }
    }),
    db.product.create({
      data: {
        name: 'AirPods Pro 2',
        description: 'Auriculares inalámbricos con cancelación activa de ruido',
        price: 249.99,
        image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400',
        stock: 50,
        sku: 'APP2-2023',
        categoryId: categories[2].id
      }
    }),
    db.product.create({
      data: {
        name: 'Apple Watch Ultra 2',
        description: 'Smartwatch resistente para deportes extremos y aventuras',
        price: 799.99,
        image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400',
        stock: 30,
        sku: 'AWU2-49MM',
        categoryId: categories[3].id
      }
    }),
    db.product.create({
      data: {
        name: 'iPad Pro 12.9"',
        description: 'Tablet profesional con chip M2 y pantalla Liquid Retina XDR',
        price: 1099.99,
        image: 'https://images.unsplash.com/photo-1544244016-0a4dfe7b4b2c?w=400',
        stock: 20,
        sku: 'IPP129-M2-2023',
        categoryId: categories[4].id
      }
    }),
    db.product.create({
      data: {
        name: 'Sony Alpha 7R V',
        description: 'Cámara mirrorless full-frame de 61MP para fotografía profesional',
        price: 3899.99,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
        stock: 10,
        sku: 'A7R5-BODY',
        categoryId: categories[5].id
      }
    }),
    db.product.create({
      data: {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Smartphone Android premium con S Pen y cámara de 200MP',
        price: 1299.99,
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
        stock: 18,
        sku: 'S24U-256',
        categoryId: categories[1].id
      }
    }),
    db.product.create({
      data: {
        name: 'Dell XPS 15',
        description: 'Laptop de alto rendimiento para creadores y gamers',
        price: 1899.99,
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
        stock: 12,
        sku: 'XPS15-I9-2023',
        categoryId: categories[0].id
      }
    })
  ])

  // Create reviews for products
  const reviews = [
    // MacBook Pro reviews
    { productId: products[0].id, rating: 5, comment: 'Excelente laptop para desarrollo de software' },
    { productId: products[0].id, rating: 4, comment: 'Muy buena pero un poco cara' },
    { productId: products[0].id, rating: 5, comment: 'La mejor laptop que he tenido' },
    
    // iPhone 15 Pro reviews
    { productId: products[1].id, rating: 5, comment: 'Cámara increíble y rendimiento excepcional' },
    { productId: products[1].id, rating: 5, comment: 'Perfecto para fotografía profesional' },
    { productId: products[1].id, rating: 4, comment: 'Muy bueno pero el precio es elevado' },
    
    // AirPods Pro 2 reviews
    { productId: products[2].id, rating: 5, comment: 'Cancelación de ruido espectacular' },
    { productId: products[2].id, rating: 4, comment: 'Muy cómodos para uso prolongado' },
    { productId: products[2].id, rating: 5, comment: 'La mejor calidad de audio' },
    
    // Apple Watch Ultra 2 reviews
    { productId: products[3].id, rating: 5, comment: 'Perfecto para deportes extremos' },
    { productId: products[3].id, rating: 4, comment: 'Muy resistente y con buena batería' },
    { productId: products[3].id, rating: 5, comment: 'El mejor smartwatch del mercado' },
    
    // iPad Pro reviews
    { productId: products[4].id, rating: 5, comment: 'Ideal para diseño digital' },
    { productId: products[4].id, rating: 4, comment: 'Pantalla increíble y gran rendimiento' },
    { productId: products[4].id, rating: 5, comment: 'Perfecto para trabajo creativo' },
    
    // Sony Alpha reviews
    { productId: products[5].id, rating: 5, comment: 'Calidad de imagen profesional' },
    { productId: products[5].id, rating: 5, comment: 'La mejor cámara que he usado' },
    { productId: products[5].id, rating: 4, comment: 'Excelente pero muy especializada' },
    
    // Samsung Galaxy reviews
    { productId: products[6].id, rating: 4, comment: 'Buena alternativa al iPhone' },
    { productId: products[6].id, rating: 5, comment: 'El S Pen es muy útil' },
    { productId: products[6].id, rating: 4, comment: 'Buena cámara y rendimiento' },
    
    // Dell XPS reviews
    { productId: products[7].id, rating: 4, comment: 'Buena laptop para trabajo' },
    { productId: products[7].id, rating: 4, comment: 'Pantalla hermosa y buen teclado' },
    { productId: products[7].id, rating: 3, comment: 'Un poco pesada pero buen rendimiento' }
  ]

  // Create demo user
  const demoUser = await db.user.create({
    data: {
      email: 'demo@techstorepro.com',
      name: 'Usuario Demo',
      password: 'demo123', // En producción esto estaría hasheado
      phone: '+34 600 000 000',
      address: 'Calle Demo 123, Madrid',
      city: 'Madrid',
      country: 'España',
      postalCode: '28001'
    }
  })

  // Create reviews in database
  for (const review of reviews) {
    await db.review.create({
      data: {
        userId: demoUser.id,
        productId: review.productId,
        rating: review.rating,
        comment: review.comment
      }
    })
  }

  // Create some sample orders
  const sampleOrders = [
    {
      userId: demoUser.id,
      status: 'DELIVERED',
      total: 2499.99,
      items: [
        { productId: products[0].id, quantity: 1, price: 2499.99 }
      ]
    },
    {
      userId: demoUser.id,
      status: 'PROCESSING',
      total: 1449.98,
      items: [
        { productId: products[1].id, quantity: 1, price: 1199.99 },
        { productId: products[2].id, quantity: 1, price: 249.99 }
      ]
    }
  ]

  for (const orderData of sampleOrders) {
    const order = await db.order.create({
      data: {
        userId: orderData.userId,
        status: orderData.status as any,
        total: orderData.total
      }
    })

    for (const item of orderData.items) {
      await db.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }
      })
    }
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })