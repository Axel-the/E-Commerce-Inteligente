'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ShoppingCart, 
  Search, 
  Star, 
  Heart, 
  User, 
  Menu, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Users,
  Filter,
  Grid,
  List,
  ArrowRight,
  Zap,
  Shield,
  Truck,
  Award,
  Eye,
  Plus,
  Minus,
  X
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import ChatWidget from '@/components/chatbot/ChatWidget'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  stock: number
  category: {
    name: string
  }
  score?: number
  reason?: string
  rating?: number
  reviewCount?: number
}

interface CartItem {
  product: Product
  quantity: number
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [loadingRecommendations, setLoadingRecommendations] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
  const { toast } = useToast()

  // Mock user ID for demo purposes
  const mockUserId = 'user-demo-123'

  // Enhanced product data with ratings and PEN prices
  const sampleProducts: Product[] = [
    {
      id: '1',
      name: 'MacBook Pro 16"',
      description: 'Potente laptop con chip M2 Pro, ideal para profesionales y creadores',
      price: 9999.99,
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
      stock: 15,
      category: { name: 'Laptops' },
      rating: 4.8,
      reviewCount: 156
    },
    {
      id: '2',
      name: 'iPhone 15 Pro',
      description: 'El smartphone más avanzado con cámara profesional y titanio',
      price: 4799.99,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      stock: 25,
      category: { name: 'Smartphones' },
      rating: 4.9,
      reviewCount: 289
    },
    {
      id: '3',
      name: 'AirPods Pro 2',
      description: 'Auriculares inalámbricos con cancelación activa de ruido',
      price: 999.99,
      image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400',
      stock: 50,
      category: { name: 'Audio' },
      rating: 4.7,
      reviewCount: 342
    },
    {
      id: '4',
      name: 'Apple Watch Ultra 2',
      description: 'Smartwatch resistente para deportes extremos y aventuras',
      price: 3199.99,
      image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400',
      stock: 30,
      category: { name: 'Wearables' },
      rating: 4.6,
      reviewCount: 198
    },
    {
      id: '5',
      name: 'iPad Pro 12.9"',
      description: 'Tablet profesional con chip M2 y pantalla Liquid Retina XDR',
      price: 4399.99,
      image: 'https://images.unsplash.com/photo-1544244016-0a4dfe7b4b2c?w=400',
      stock: 20,
      category: { name: 'Tablets' },
      rating: 4.8,
      reviewCount: 167
    },
    {
      id: '6',
      name: 'Sony Alpha 7R V',
      description: 'Cámara mirrorless full-frame de 61MP para fotografía profesional',
      price: 15599.99,
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
      stock: 10,
      category: { name: 'Cámaras' },
      rating: 4.9,
      reviewCount: 89
    },
    {
      id: '7',
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Smartphone Android premium con S Pen y cámara de 200MP',
      price: 5199.99,
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
      stock: 18,
      category: { name: 'Smartphones' },
      rating: 4.7,
      reviewCount: 234
    },
    {
      id: '8',
      name: 'Dell XPS 15',
      description: 'Laptop de alto rendimiento para creadores y gamers',
      price: 7599.99,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
      stock: 12,
      category: { name: 'Laptops' },
      rating: 4.5,
      reviewCount: 143
    },
    {
      id: '9',
      name: 'Xiaomi Redmi Note 13',
      description: 'Smartphone con excelente relación calidad-precio para el mercado peruano',
      price: 1299.99,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      stock: 45,
      category: { name: 'Smartphones' },
      rating: 4.4,
      reviewCount: 567
    },
    {
      id: '10',
      name: 'Lenovo IdeaPad 3',
      description: 'Laptop ideal para estudiantes y trabajo remoto en Perú',
      price: 2499.99,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
      stock: 30,
      category: { name: 'Laptops' },
      rating: 4.3,
      reviewCount: 234
    },
    {
      id: '11',
      name: 'JBL Flip 6',
      description: 'Bocina portátil Bluetooth resistente al agua',
      price: 399.99,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
      stock: 60,
      category: { name: 'Audio' },
      rating: 4.6,
      reviewCount: 445
    },
    {
      id: '12',
      name: 'Huawei Band 8',
      description: 'Smartband fitness con monitor de salud y batería de larga duración',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1557935728-e6d1eaabe729?w=400',
      stock: 80,
      category: { name: 'Wearables' },
      rating: 4.5,
      reviewCount: 678
    }
  ]

  useEffect(() => {
    // Simular carga de productos
    setTimeout(() => {
      setProducts(sampleProducts)
      setFilteredProducts(sampleProducts)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    // Fetch AI recommendations
    const fetchRecommendations = async () => {
      try {
        setLoadingRecommendations(true)
        
        // Fetch personalized recommendations
        const personalResponse = await fetch(`/api/recommendations?userId=${mockUserId}&type=PERSONALIZED`)
        if (personalResponse.ok) {
          const personalData = await personalResponse.json()
          setRecommendations(personalData.recommendations || sampleProducts.slice(0, 4))
        }

        // Fetch trending recommendations
        const trendingResponse = await fetch(`/api/recommendations?userId=${mockUserId}&type=TRENDING`)
        if (trendingResponse.ok) {
          const trendingData = await trendingResponse.json()
          setTrendingProducts(trendingData.recommendations || sampleProducts.slice(2, 6))
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
        // Fallback to sample recommendations
        setRecommendations(sampleProducts.slice(0, 4))
        setTrendingProducts(sampleProducts.slice(2, 6))
      } finally {
        setLoadingRecommendations(false)
      }
    }

    fetchRecommendations()
  }, [])

  useEffect(() => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category.name === selectedCategory
      )
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )

    setFilteredProducts(filtered)
  }, [searchTerm, selectedCategory, priceRange, products])

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category.name)))]

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id)
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prev, { product, quantity: 1 }]
      }
    })

    toast({
      title: "✅ Producto añadido",
      description: `${product.name} se ha añadido al carrito`,
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
    toast({
      title: "Producto eliminado",
      description: "El producto se ha eliminado del carrito",
    })
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId)
      return
    }
    
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-red-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                TechStore Perú
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Productos</a>
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Categorías</a>
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Ofertas</a>
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Soporte</a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-slate-600 hover:text-blue-600">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-600 hover:text-blue-600">
              <Heart className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-600 hover:text-blue-600 relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {getCartItemCount() > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-blue-600 text-white">
                  {getCartItemCount()}
                </Badge>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-600 hover:text-blue-600">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden text-slate-600 hover:text-blue-600">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Sparkles className="h-3 w-3 mr-1" />
              Lo Mejor de la Tecnología 2025 - Perú
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Tecnología que 
              <span className="text-yellow-300"> Transforma</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100 max-w-2xl mx-auto">
              Descubre los productos más innovadores con recomendaciones personalizadas por IA. Precios en Soles y envío a todo Perú.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 text-lg px-8 py-4 rounded-full font-semibold shadow-lg">
                Explorar Productos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600 text-lg px-8 py-4 rounded-full font-semibold">
                Ver Ofertas
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Truck className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Envío a todo Perú</p>
                <p className="text-xs text-slate-500">2-5 días hábiles</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Garantía Oficial</p>
                <p className="text-xs text-slate-500">1-2 años según producto</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Precios Competitivos</p>
                <p className="text-xs text-slate-500">En Soles Peruanos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Soporte Local</p>
                <p className="text-xs text-slate-500">Atención en español</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Recommendations Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            Inteligencia Artificial
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            Recomendaciones Personalizadas
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Nuestra IA analiza tus preferencias para sugerirte los productos perfectos para ti, con precios en Soles Peruanos
          </p>
        </div>

        {loadingRecommendations ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-64 bg-slate-200 rounded-t-lg"></div>
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {recommendations.map((product) => (
              <Card key={`rec-${product.id}`} className="group hover:shadow-xl transition-all duration-500 border-0 shadow-lg hover:border-red-200 overflow-hidden">
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-800 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Para Ti
                  </Badge>
                  {product.score && (
                    <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm">
                      {Math.round(product.score * 100)}% match
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button 
                      size="sm" 
                      className="w-full bg-white text-red-600 hover:bg-red-50"
                      onClick={() => addToCart(product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Añadir al carrito
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.category.name}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {renderStars(product.rating || 4.5)}
                      <span className="text-sm text-slate-500">({product.reviewCount || 0})</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg mb-2 line-clamp-2">{product.name}</CardTitle>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  {product.reason && (
                    <p className="text-xs text-red-600 mb-3 font-medium">
                      💡 {product.reason}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-red-600">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-slate-500">
                      Stock: {product.stock}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white rounded-full font-semibold"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.stock === 0 ? 'Agotado' : 'Añadir al carrito'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Trending Products Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-orange-100 text-orange-700">
            <TrendingUp className="h-3 w-3 mr-1" />
            Trending Ahora
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Productos Más Populares</h2>
          <p className="text-xl text-slate-600">
            Los productos más deseados por nuestros clientes
          </p>
        </div>

        {loadingRecommendations ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-64 bg-slate-200 rounded-t-lg"></div>
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingProducts.map((product) => (
              <Card key={`trending-${product.id}`} className="group hover:shadow-xl transition-all duration-500 border-0 shadow-lg hover:border-red-200 overflow-hidden">
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-800 text-white">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button 
                      size="sm" 
                      className="w-full bg-white text-red-600 hover:bg-red-50"
                      onClick={() => addToCart(product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Añadir al carrito
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.category.name}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {renderStars(product.rating || 4.5)}
                      <span className="text-sm text-slate-500">({product.reviewCount || 0})</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg mb-2 line-clamp-2">{product.name}</CardTitle>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-red-600">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-slate-500">
                      Stock: {product.stock}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white rounded-full font-semibold"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.stock === 0 ? 'Agotado' : 'Añadir al carrito'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Special Offers Section */}
      <section className="bg-gradient-to-r from-yellow-50 to-orange-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-yellow-100 text-yellow-700">
              <Award className="h-3 w-3 mr-1" />
              Ofertas Especiales
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Promociones Exclusivas
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Aprovecha nuestras ofertas limitadas y descuentos especiales en productos seleccionados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Offer 1 */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400" 
                  alt="Oferta Laptops"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-600 text-white text-lg px-3 py-1">
                    -20% OFF
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">Laptops Premium</h3>
                  <p className="text-sm">MacBook, Dell, Lenovo</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-500 line-through">Desde S/12,000</p>
                    <p className="text-2xl font-bold text-red-600">Desde S/9,600</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Oferta válida hasta</p>
                    <p className="text-sm font-semibold">31/12/2025</p>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                  Ver Ofertas
                </Button>
              </div>
            </div>

            {/* Offer 2 */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400" 
                  alt="Oferta Smartphones"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-600 text-white text-lg px-3 py-1">
                    -15% OFF
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">Smartphones</h3>
                  <p className="text-sm">iPhone, Samsung, Xiaomi</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-500 line-through">Desde S/6,000</p>
                    <p className="text-2xl font-bold text-red-600">Desde S/5,100</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Oferta válida hasta</p>
                    <p className="text-sm font-semibold">15/01/2025</p>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                  Ver Ofertas
                </Button>
              </div>
            </div>

            {/* Offer 3 */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400" 
                  alt="Oferta Audio"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-600 text-white text-lg px-3 py-1">
                    -30% OFF
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">Audio & Wearables</h3>
                  <p className="text-sm">AirPods, Watches, Bands</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-500 line-through">Desde S/1,400</p>
                    <p className="text-2xl font-bold text-red-600">Desde S/980</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Oferta válida hasta</p>
                    <p className="text-sm font-semibold">31/12/2025</p>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                  Ver Ofertas
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">Explora Nuestro Catálogo</h2>
            <p className="text-xl text-slate-600">
              Encuentra el producto perfecto entre nuestra selección premium
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  placeholder="Buscar productos, categorías, marcas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 rounded-lg border-slate-200 focus:border-blue-500"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12 rounded-lg border-slate-200 focus:border-blue-500">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.slice(1).map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-12 w-12 rounded-lg"
                >
                  <Grid className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="h-12 w-12 rounded-lg"
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="h-64 bg-slate-200 rounded-t-lg"></div>
                    <CardContent className="p-4 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {filteredProducts.map((product) => (
                  viewMode === 'grid' ? (
                    <Card key={product.id} className="group hover:shadow-xl transition-all duration-500 border-0 shadow-lg hover:border-blue-200 overflow-hidden">
                      <div className="relative overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <Badge className="absolute top-4 right-4 bg-blue-600 text-white">
                          {product.category.name}
                        </Badge>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1">
                            {renderStars(product.rating || 4.5)}
                            <span className="text-sm text-slate-500">({product.reviewCount || 0})</span>
                          </div>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardTitle className="text-lg mb-2 line-clamp-2">{product.name}</CardTitle>
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-blue-600">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-sm text-slate-500">
                            Stock: {product.stock}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-6 pt-0">
                        <Button 
                          onClick={() => addToCart(product)}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-semibold"
                          disabled={product.stock === 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {product.stock === 0 ? 'Agotado' : 'Añadir al carrito'}
                        </Button>
                      </CardFooter>
                    </Card>
                  ) : (
                    <Card key={product.id} className="hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex space-x-6">
                          <div className="flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <Badge variant="secondary">{product.category.name}</Badge>
                                  <div className="flex items-center space-x-1">
                                    {renderStars(product.rating || 4.5)}
                                    <span className="text-sm text-slate-500">({product.reviewCount || 0})</span>
                                  </div>
                                </div>
                                <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                                <p className="text-slate-600 mb-3">{product.description}</p>
                              </div>
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500">
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-blue-600">
                                {formatPrice(product.price)}
                              </span>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm text-slate-500">
                                  Stock: {product.stock}
                                </span>
                                <Button 
                                  onClick={() => addToCart(product)}
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-semibold"
                                  disabled={product.stock === 0}
                                >
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Añadir
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No se encontraron productos</h3>
                <p className="text-slate-600">Intenta ajustar tus filtros o términos de búsqueda</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Analytics Dashboard Section */}
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-purple-700">
              <TrendingUp className="h-3 w-3 mr-1" />
              Análisis Avanzado
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Insights y Predicciones
            </h2>
            <p className="text-xl text-slate-300">
              Dashboard con análisis predictivo basado en inteligencia artificial
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <AnalyticsDashboard userId={mockUserId} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-8 w-8 text-blue-400" />
                <h3 className="text-xl font-bold">TechStore Pro</h3>
              </div>
              <p className="text-slate-400 mb-4">
                Tu plataforma de tecnología con inteligencia artificial integrada para la mejor experiencia de compra.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">in</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Todos los Productos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ofertas Especiales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Nuevos Lanzamientos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Marcas Premium</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Soporte al Cliente</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de Devoluciones</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Garantía y Servicios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto Directo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center space-x-2">
                  <span>📧</span>
                  <span>support@techstorepro.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>+34 900 123 456</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>Calle Tecnología 123, Madrid</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>🕒</span>
                  <span>24/7 Soporte Online</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 mb-4 md:mb-0">
                © 2024 TechStore Pro. Todos los derechos reservados.
              </p>
              <div className="flex space-x-6 text-slate-400">
                <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                <a href="#" className="hover:text-white transition-colors">Términos</a>
                <a href="#" className="hover:text-white transition-colors">Cookies</a>
                <a href="#" className="hover:text-white transition-colors">Legal</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Shopping Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="relative w-screen max-w-md">
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Carrito de Compras</h2>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                        onClick={() => setIsCartOpen(false)}
                      >
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Close panel</span>
                        <X className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flow-root">
                      {cart.length === 0 ? (
                        <div className="text-center py-12">
                          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Tu carrito está vacío</h3>
                          <p className="mt-1 text-sm text-gray-500">Añade algunos productos para empezar</p>
                        </div>
                      ) : (
                        <ul className="-my-6 divide-y divide-gray-200">
                          {cart.map((item) => (
                            <li key={item.product.id} className="flex py-6">
                              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover object-center"
                                />
                              </div>

                              <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>{item.product.name}</h3>
                                    <p className="ml-4">{formatPrice(item.product.price)}</p>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-500">{item.product.category.name}</p>
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-8 text-center">{item.quantity}</span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <button
                                    type="button"
                                    className="font-medium text-red-600 hover:text-red-500"
                                    onClick={() => removeFromCart(item.product.id)}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {cart.length > 0 && (
                  <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Subtotal</p>
                      <p>{formatPrice(getCartTotal())}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">Envío e impuestos calculados al finalizar.</p>
                    <div className="mt-6">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Finalizar Compra
                      </Button>
                    </div>
                    <div className="mt-4 flex justify-center text-sm text-gray-500">
                      <button
                        type="button"
                        className="text-blue-600 font-medium hover:text-blue-500"
                        onClick={() => setIsCartOpen(false)}
                      >
                        Seguir comprando
                        <span aria-hidden="true"> &rarr;</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      <ChatWidget userId={mockUserId} />
    </div>
  )
}