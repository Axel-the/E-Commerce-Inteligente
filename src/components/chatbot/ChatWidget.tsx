'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, X, Send, Bot, User, Clock, Sparkles, TrendingUp, Award, ShoppingCart } from 'lucide-react'

interface ChatMessage {
  id?: string
  message: string
  response?: string
  isBot: boolean
  timestamp?: string
  isUser?: boolean
}

interface ChatWidgetProps {
  userId?: string
}

export default function ChatWidget({ userId = 'guest' }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Ejemplos de preguntas rápidas
  const quickQuestions = [
    "¿Cuál es el producto más vendido?",
    "¿Qué producto es el más caro?",
    "¿Cuál tiene la mejor calificación?",
    "¿Cuántos productos tienes disponibles?",
    "¿Recomiéndame un buen smartphone",
    "¿Qué laptops tienes para estudiantes?",
    "¿Tienen productos con envío gratis?",
    "¿Cuáles son las ofertas actuales?",
    "¿Qué productos tienen garantía?",
    "¿Aceptan pagos en cuotas?"
  ]

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        isBot: true,
        message: '',
        response: '¡Hola! 👋 Soy tu asistente virtual de TechStore Perú. Estoy aquí para ayudarte a encontrar los productos perfectos para ti. \n\nPuedes preguntarme sobre:\n• Precios en Soles (S/) y especificaciones técnicas\n• Disponibilidad de stock y envíos a todo Perú\n• Recomendaciones personalizadas según tus necesidades\n• Ofertas especiales y promociones\n• Garantías y políticas de devolución\n• Opciones de pago y cuotas\n\n¿En qué puedo ayudarte hoy?',
        timestamp: new Date().toISOString()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length])

  // Load chat history when chat opens
  useEffect(() => {
    if (isOpen && userId !== 'guest') {
      loadChatHistory()
    }
  }, [isOpen, userId])

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`/api/chatbot?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages)
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question)
    setTimeout(() => handleSendMessage(), 100)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      isBot: false,
      message: inputMessage,
      isUser: true,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    const messageToSend = inputMessage
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          userId,
          conversationHistory: messages
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTimeout(() => {
          setIsTyping(false)
          const botMessage: ChatMessage = {
            isBot: true,
            message: messageToSend,
            response: data.response,
            timestamp: data.timestamp
          }
          setMessages(prev => [...prev, botMessage])
        }, 1000) // Simulate typing delay
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setIsTyping(false)
      const errorMessage: ChatMessage = {
        isBot: true,
        message: messageToSend,
        response: 'Lo siento, estoy teniendo problemas para responder. Por favor, intenta de nuevo más tarde.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="relative group hover:scale-110 transition-all duration-300 rounded-full w-16 h-16 p-0 shadow-lg hover:shadow-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
          size="lg"
        >
          <MessageSquare className="h-6 w-6 text-white" />
          <span className="sr-only">Abrir chat</span>
          {/* Pulsing animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 to-red-800 animate-ping opacity-30"></div>
          {/* Notification dot */}
          <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md">
        <CardHeader className="pb-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="h-6 w-6" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Asistente IA</CardTitle>
                <p className="text-xs text-red-100">TechStore Perú - En línea</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96 px-4 pb-4">
            <div className="space-y-4 py-4">
              {messages.map((msg, index) => (
                <div key={index} className="flex flex-col space-y-2">
                  {msg.isUser !== false && (
                    <div className="flex justify-end">
                      <div className="max-w-[80%]">
                        <div className="flex items-center justify-end space-x-2 mb-1">
                          <span className="text-xs text-slate-500">Tú</span>
                          <span className="text-xs text-slate-500">
                            {msg.timestamp && formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-2xl rounded-br-none px-4 py-2 text-sm shadow-lg">
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {msg.isBot && msg.response && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%]">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="flex items-center space-x-1">
                            <Bot className="h-3 w-3 text-red-600" />
                            <span className="text-xs text-slate-500 font-medium">Asistente IA</span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {msg.timestamp && formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <div className="bg-slate-100 rounded-2xl rounded-bl-none px-4 py-3 text-sm text-slate-800 shadow-sm">
                          <div className="prose prose-sm max-w-none">
                            {msg.response.split('\n').map((line, i) => (
                              <p key={i} className="mb-2 last:mb-0">{line}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%]">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="flex items-center space-x-1">
                        <Bot className="h-3 w-3 text-blue-600" />
                        <span className="text-xs text-slate-500 font-medium">Asistente IA</span>
                      </div>
                    </div>
                    <div className="bg-slate-100 rounded-2xl rounded-bl-none px-4 py-3 text-sm text-slate-800 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-slate-500 text-sm">Escribiendo...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-slate-500 mb-2 font-medium">Preguntas frecuentes:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="border-t p-4 bg-slate-50">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading || isTyping}
                className="flex-1 border-slate-200 focus:border-blue-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || isTyping}
                size="icon"
                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                <span>Tiempo de respuesta: ~2-3 segundos</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <Sparkles className="h-3 w-3" />
                <span>Powered by AI</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}