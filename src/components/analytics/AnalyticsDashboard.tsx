'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Star,
  Target,
  AlertTriangle,
  Lightbulb,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react'

interface AnalyticsData {
  period: string
  overview: {
    totalSales: number
    totalOrders: number
    avgOrderValue: number
    totalCustomers: number
  }
  dailySales: Array<{
    date: string
    sales: number
    orders: number
  }>
  productPerformance: Array<{
    id: string
    name: string
    category: string
    price: number
    stock: number
    quantitySold: number
    revenue: number
    avgRating: number
    reviewCount: number
  }>
  categoryPerformance: Array<{
    category: string
    revenue: number
    quantity: number
    products: number
  }>
  aiInsights: {
    trends?: string[]
    predictions?: any
    recommendations?: string[]
    opportunities?: string[]
    risks?: string[]
  }
  predictions?: any
  timestamp: string
}

interface AnalyticsDashboardProps {
  userId?: string
}

export default function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics?period=${selectedPeriod}&type=overview`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-ES').format(value)
  }

  const getChangeIcon = (trend: 'upward' | 'downward' | 'stable') => {
    switch (trend) {
      case 'upward':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'downward':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No se pudieron cargar los datos de análisis</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold">Análisis Predictivo de Ventas</h2>
          <p className="text-muted-foreground">
            Insights y predicciones basadas en IA
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} variant="outline">
            Actualizar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.overview.totalSales)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.predictions?.next30Days && (
                <span className="text-green-600">
                  +{Math.round(((analytics.predictions.next30Days.sales - analytics.overview.totalSales) / analytics.overview.totalSales) * 100)}% pronosticado
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalOrders)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.overview.avgOrderValue)} promedio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalCustomers)}</div>
            <p className="text-xs text-muted-foreground">
              Clientes únicos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicción 30d</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.predictions?.next30Days ? 
                formatCurrency(analytics.predictions.next30Days.sales) : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Ventas proyectadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="predictions">Predicciones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Rendimiento por Categoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.categoryPerformance.slice(0, 5).map((category, index) => {
                  const totalRevenue = analytics.categoryPerformance.reduce((sum, c) => sum + c.revenue, 0)
                  const percentage = (category.revenue / totalRevenue) * 100
                  
                  return (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(category.revenue)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {category.quantity} unidades vendidas • {category.products} productos
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Productos Más Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.productPerformance.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm">{product.quantitySold} unidades</span>
                        <span className="text-sm">★ {product.avgRating.toFixed(1)}</span>
                        <span className="text-sm">{product.reviewCount} reseñas</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(product.revenue)}</div>
                      <div className="text-sm text-muted-foreground">{formatCurrency(product.price)} c/u</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {analytics.aiInsights.trends && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Tendencias Identificadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.aiInsights.trends.map((trend, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <p className="text-sm">{trend}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analytics.aiInsights.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Recomendaciones Estratégicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.aiInsights.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Badge variant="secondary" className="mt-0.5">
                        {index + 1}
                      </Badge>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analytics.aiInsights.opportunities && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Oportunidades de Crecimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.aiInsights.opportunities.map((opportunity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <p className="text-sm">{opportunity}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analytics.aiInsights.risks && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Riesgos Identificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.aiInsights.risks.map((risk, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <p className="text-sm">{risk}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Análisis de Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.productPerformance.map((product, index) => (
                  <div key={product.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                    <div className="md:col-span-2">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{formatCurrency(product.revenue)}</div>
                      <div className="text-sm text-muted-foreground">Ingresos</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{product.quantitySold}</div>
                      <div className="text-sm text-muted-foreground">Unidades</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">★ {product.avgRating.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">{product.reviewCount}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{product.stock}</div>
                      <div className="text-sm text-muted-foreground">Stock</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          {analytics.predictions && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Predicciones a 30 Días
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(analytics.predictions.next30Days.sales)}
                      </div>
                      <div className="text-sm text-muted-foreground">Ventas Proyectadas</div>
                      <div className="text-xs text-green-600 mt-1">
                        +{Math.round(((analytics.predictions.next30Days.sales - analytics.overview.totalSales) / analytics.overview.totalSales) * 100)}%
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {formatNumber(analytics.predictions.next30Days.orders)}
                      </div>
                      <div className="text-sm text-muted-foreground">Pedidos Estimados</div>
                      <div className="text-xs text-green-600 mt-1">
                        +{Math.round(((analytics.predictions.next30Days.orders - analytics.overview.totalOrders) / analytics.overview.totalOrders) * 100)}%
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(analytics.predictions.next30Days.avgOrderValue)}
                      </div>
                      <div className="text-sm text-muted-foreground">Valor Promedio</div>
                      <div className="text-xs text-green-600 mt-1">
                        +{Math.round(((analytics.predictions.next30Days.avgOrderValue - analytics.overview.avgOrderValue) / analytics.overview.avgOrderValue) * 100)}%
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {formatNumber(analytics.predictions.next30Days.customers)}
                      </div>
                      <div className="text-sm text-muted-foreground">Nuevos Clientes</div>
                      <div className="text-xs text-green-600 mt-1">
                        +{Math.round(((analytics.predictions.next30Days.customers - analytics.overview.totalCustomers) / analytics.overview.totalCustomers) * 100)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {analytics.predictions.topGrowingProducts && (
                <Card>
                  <CardHeader>
                    <CardTitle>Productos con Mayor Potencial de Crecimiento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.predictions.topGrowingProducts.map((product: any, index: number) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="font-medium">{product.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-green-600">
                              +{Math.round((product.growthRate - 1) * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {analytics.predictions.seasonalTrends && (
                <Card>
                  <CardHeader>
                    <CardTitle>Análisis de Tendencia Estacional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          {getChangeIcon(analytics.predictions.seasonalTrends.direction)}
                        </div>
                        <div className="text-lg font-bold capitalize">
                          {analytics.predictions.seasonalTrends.direction === 'upward' ? 'Alcista' : 
                           analytics.predictions.seasonalTrends.direction === 'downward' ? 'Bajista' : 'Estable'}
                        </div>
                        <div className="text-sm text-muted-foreground">Tendencia Actual</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {analytics.predictions.seasonalTrends.changePercentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Cambio Porcentual</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {formatCurrency(analytics.predictions.seasonalTrends.recentAverage)}
                        </div>
                        <div className="text-sm text-muted-foreground">Promedio Reciente</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}