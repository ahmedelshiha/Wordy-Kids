import React from 'react'
import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react'
import { useEffect, useState } from 'react'

interface BuilderPageProps {
  model?: string
  content?: any
  data?: any
}

export const BuilderPageWrapper: React.FC<BuilderPageProps> = ({ 
  model = 'page', 
  content,
  data 
}) => {
  const [pageContent, setPageContent] = useState(content)
  const isPreviewing = useIsPreviewing()

  useEffect(() => {
    // If no content provided, fetch from Builder.io
    if (!pageContent) {
      const fetchContent = async () => {
        try {
          const content = await builder
            .get(model, { 
              url: window.location.pathname,
              ...data 
            })
            .toPromise()
          
          setPageContent(content)
        } catch (error) {
          console.error('Error fetching Builder.io content:', error)
        }
      }
      
      fetchContent()
    }
  }, [model, pageContent, data])

  // Show loading state
  if (!pageContent && !isPreviewing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading educational content...</p>
        </div>
      </div>
    )
  }

  // Get current user data for educational context
  const getCurrentUser = () => {
    try {
      const currentUser = localStorage.getItem('wordAdventureCurrentUser')
      const guestSession = localStorage.getItem('wordAdventureGuestSession')
      
      if (currentUser) {
        return JSON.parse(currentUser)
      } else if (guestSession === 'active') {
        return {
          id: 'guest-user',
          name: 'Guest Explorer',
          type: 'guest',
          isGuest: true
        }
      }
      return null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  // Get user progress data for educational context
  const getUserProgress = () => {
    try {
      const progress = localStorage.getItem('wordAdventureProgress')
      const learningStats = localStorage.getItem('learningStats')
      const childStats = localStorage.getItem('childStats')
      
      return {
        progress: progress ? JSON.parse(progress) : {},
        learningStats: learningStats ? JSON.parse(learningStats) : {},
        childStats: childStats ? JSON.parse(childStats) : {}
      }
    } catch (error) {
      console.error('Error getting user progress:', error)
      return {}
    }
  }

  // Educational context for Builder components
  const educationalContext = {
    // User data
    user: getCurrentUser(),
    
    // Learning progress and achievements
    ...getUserProgress(),
    
    // Educational settings
    settings: (() => {
      try {
        const settings = localStorage.getItem('jungleAdventureSettings')
        return settings ? JSON.parse(settings) : {}
      } catch {
        return {}
      }
    })(),
    
    // Current lesson context
    currentLesson: (() => {
      try {
        const session = localStorage.getItem('wordAdventureSession')
        return session ? JSON.parse(session) : null
      } catch {
        return null
      }
    })(),
    
    // Helper functions that Builder components can use
    // Note: These would need to be bound to actual functions in a real implementation
    completeLesson: (lessonId: string) => {
      console.log('Lesson completed:', lessonId)
      // Integration with actual lesson completion logic
    },
    
    updateProgress: (progressData: any) => {
      console.log('Progress updated:', progressData)
      // Integration with actual progress tracking
    },
    
    playSound: (soundType: string) => {
      console.log('Playing sound:', soundType)
      // Integration with audio service
    },
    
    // Environment information
    environment: {
      isDevelopment: import.meta.env.DEV,
      isPreview: isPreviewing,
      timestamp: new Date().toISOString()
    }
  }

  return (
    <BuilderComponent 
      model={model} 
      content={pageContent}
      data={{
        ...data,
        ...educationalContext
      }}
      // Pass context data that educational components might need
      context={educationalContext}
    />
  )
}

export default BuilderPageWrapper
