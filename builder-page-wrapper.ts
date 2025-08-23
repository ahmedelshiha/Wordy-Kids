// client/components/BuilderPageWrapper.tsx
import React, { useState, useEffect } from 'react'
import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react'
import { LoadingSpinner } from './common/LoadingSpinner'
import { ErrorBoundary } from './ErrorBoundary'

interface BuilderPageProps {
  model: string
  content?: any
  urlPath?: string
  children?: React.ReactNode
}

export const BuilderPageWrapper: React.FC<BuilderPageProps> = ({ 
  model, 
  content, 
  urlPath,
  children 
}) => {
  const [builderContent, setBuilderContent] = useState(content)
  const [isLoading, setIsLoading] = useState(!content)
  const [error, setError] = useState<string | null>(null)
  const isPreviewing = useIsPreviewing()

  useEffect(() => {
    // If content is already provided, skip the API call
    if (content) {
      setBuilderContent(content)
      setIsLoading(false)
      return
    }

    // Fetch content from Builder.io
    const fetchContent = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const fetchedContent = await builder
          .get(model, {
            url: urlPath || window.location.pathname,
            // Educational targeting options
            userAttributes: {
              age: localStorage.getItem('childAge'),
              learningLevel: localStorage.getItem('learningLevel'),
              interests: JSON.parse(localStorage.getItem('learningInterests') || '[]')
            }
          })
          .toPromise()

        if (fetchedContent) {
          setBuilderContent(fetchedContent)
        } else if (!isPreviewing) {
          setError('Content not found')
        }
      } catch (err) {
        console.error('Error fetching Builder content:', err)
        setError('Failed to load content')
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [model, content, urlPath, isPreviewing])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
        <LoadingSpinner size="lg" />
        <span className="ml-4 text-lg text-green-800">Loading educational content...</span>
      </div>
    )
  }

  // Show error state
  if (error && !isPreviewing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🏗️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Content Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          {children && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Default Content</h3>
              {children}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render Builder.io content with error boundary
  return (
    <ErrorBoundary fallback={
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">Content Error</h2>
        <p className="text-gray-600">There was an issue displaying this content.</p>
        {children}
      </div>
    }>
      <BuilderComponent 
        model={model} 
        content={builderContent}
        // Make educational components available in Builder context
        context={{ 
          // Core educational components
          JungleKidNav: () => import('./JungleKidNav'),
          WordCard: () => import('./WordCard'),
          WordGarden: () => import('./WordGarden'),
          SettingsPanel: () => import('./SettingsPanel'),
          
          // Game components
          WordAdventure: () => import('./games/WordAdventure'),
          InteractiveQuiz: () => import('./InteractiveQuiz'),
          
          // Achievement system
          AchievementBadge: () => import('./AchievementBadge'),
          ProgressTracker: () => import('./ProgressTracker'),
          
          // AI components
          AIWordRecommendation: () => import('./AIWordRecommendation'),
          
          // Parent features
          ParentDashboard: () => import('./ParentDashboard'),
          
          // Utility components
          LoadingSpinner: () => import('./common/LoadingSpinner'),
          
          // Educational data and utilities
          getCurrentLearningLevel: () => localStorage.getItem('learningLevel') || 'beginner',
          getChildAge: () => parseInt(localStorage.getItem('childAge') || '5'),
          getLearningInterests: () => JSON.parse(localStorage.getItem('learningInterests') || '["animals"]'),
          
          // Sound management for Builder components
          playEducationalSound: (soundPath: string) => {
            const audio = new Audio(soundPath)
            audio.play().catch(console.warn)
          }
        }}
        // Custom CSS for educational styling
        customComponents={{
          // Override default Builder styles for educational context
          section: (props: any) => (
            <section 
              {...props} 
              className={`${props.className || ''} educational-section`}
              style={{
                ...props.style,
                fontFamily: '"Comic Neue", "Fredoka", sans-serif'
              }}
            />
          ),
          button: (props: any) => (
            <button
              {...props}
              className={`
                ${props.className || ''} 
                educational-button
                bg-gradient-to-r from-green-400 to-blue-500 
                hover:from-green-500 hover:to-blue-600
                text-white font-bold py-3 px-6 rounded-full
                transform transition-all duration-200 
                hover:scale-105 active:scale-95
                shadow-lg hover:shadow-xl
              `}
            />
          )
        }}
      />
    </ErrorBoundary>
  )
}

// Specialized wrapper for educational pages
export const EducationalPageWrapper: React.FC<{
  model: string
  content?: any
  childAge?: number
  learningLevel?: 'beginner' | 'intermediate' | 'advanced'
  fallbackContent?: React.ReactNode
}> = ({ 
  model, 
  content, 
  childAge, 
  learningLevel,
  fallbackContent 
}) => {
  useEffect(() => {
    // Set educational context for targeting
    if (childAge) {
      localStorage.setItem('childAge', childAge.toString())
    }
    if (learningLevel) {
      localStorage.setItem('learningLevel', learningLevel)
    }
  }, [childAge, learningLevel])

  return (
    <div className="educational-page-wrapper bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 min-h-screen">
      <BuilderPageWrapper 
        model={model}
        content={content}
      >
        {fallbackContent}
      </BuilderPageWrapper>
    </div>
  )
}

// Wrapper specifically for marketing/parent-facing pages
export const MarketingPageWrapper: React.FC<{
  model: string
  content?: any
}> = ({ model, content }) => {
  return (
    <div className="marketing-page-wrapper">
      <BuilderPageWrapper 
        model={model}
        content={content}
      >
        <div className="text-center p-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Wordy Kids</h1>
          <p className="text-xl text-gray-600">Educational adventures await!</p>
        </div>
      </BuilderPageWrapper>
    </div>
  )
}

export default BuilderPageWrapper