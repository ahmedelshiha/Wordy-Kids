#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Asset checking script for Wordy Kids
const checkAssets = () => {
  const publicDir = path.join(__dirname, '..', 'public')
  const soundsDir = path.join(publicDir, 'sounds')
  const soundsUIDir = path.join(soundsDir, 'ui')
  const imagesDir = path.join(publicDir, 'images')

  console.log('🔍 Checking Wordy Kids Assets...\n')
  console.log('📁 Asset Directories:')
  console.log(`   Public: ${publicDir}`)
  console.log(`   Sounds: ${soundsDir}`)
  console.log(`   Images: ${imagesDir}\n`)

  let totalIssues = 0

  // Check sounds directory
  if (fs.existsSync(soundsDir)) {
    const soundFiles = fs.readdirSync(soundsDir).filter(file => 
      file.endsWith('.mp3') && !fs.statSync(path.join(soundsDir, file)).isDirectory()
    )
    console.log('🎵 Found sound files:')
    soundFiles.forEach(file => {
      const filePath = path.join(soundsDir, file)
      const stats = fs.statSync(filePath)
      const sizeKB = Math.round(stats.size / 1024)
      console.log(`  ✅ ${file} (${sizeKB}KB)`)
    })
    console.log(`   Total: ${soundFiles.length} sound files`)
  } else {
    console.log('❌ /sounds directory not found!')
    totalIssues++
  }

  // Check UI sounds directory
  if (fs.existsSync(soundsUIDir)) {
    const uiSoundFiles = fs.readdirSync(soundsUIDir).filter(file => file.endsWith('.mp3'))
    console.log('\n🔊 Found UI sound files:')
    uiSoundFiles.forEach(file => {
      const filePath = path.join(soundsUIDir, file)
      const stats = fs.statSync(filePath)
      const sizeKB = Math.round(stats.size / 1024)
      console.log(`  ✅ ${file} (${sizeKB}KB)`)
    })
    console.log(`   Total: ${uiSoundFiles.length} UI sound files`)
  } else {
    console.log('\n❌ /sounds/ui directory not found!')
    totalIssues++
  }

  // Check images directory
  if (fs.existsSync(imagesDir)) {
    const imageFiles = fs.readdirSync(imagesDir).filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'].includes(ext) &&
             !fs.statSync(path.join(imagesDir, file)).isDirectory()
    })
    console.log('\n🖼️ Found image files:')
    imageFiles.forEach(file => {
      const filePath = path.join(imagesDir, file)
      const stats = fs.statSync(filePath)
      const sizeKB = Math.round(stats.size / 1024)
      console.log(`  ✅ ${file} (${sizeKB}KB)`)
    })
    console.log(`   Total: ${imageFiles.length} image files`)
  } else {
    console.log('\n❌ /images directory not found!')
    totalIssues++
  }

  // Check for specific required assets based on AssetManager mappings
  const requiredAssets = {
    'Core Animal Sounds': [
      'sounds/owl.mp3',
      'sounds/RedParot.mp3', 
      'sounds/Kapuzineraffe.mp3',
      'sounds/Elefant.mp3',
      'sounds/Tiger.mp3',
      'sounds/Löwe.mp3',
      'sounds/Gorilla.mp3'
    ],
    'UI Sounds': [
      'sounds/ui/settings-saved.mp3',
      'sounds/ui/settings-reset.mp3',
      'sounds/ui/voice-preview.mp3'
    ],
    'Ambient Jungle Sounds': [
      'sounds/jungle-birds.mp3',
      'sounds/jungle-insects.mp3',
      'sounds/jungle-rain.mp3',
      'sounds/jungle-waterfall.mp3',
      'sounds/jungle-wind.mp3'
    ],
    'Core Images': [
      'images/Wordy Jungle Adventure Logo.png',
      'favicon.svg'
    ]
  }

  console.log('\n🔍 Checking required assets by category:')
  
  Object.entries(requiredAssets).forEach(([category, assets]) => {
    console.log(`\n📋 ${category}:`)
    let categoryIssues = 0
    
    assets.forEach(asset => {
      const fullPath = path.join(publicDir, asset)
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath)
        const sizeKB = Math.round(stats.size / 1024)
        console.log(`  ✅ ${asset} (${sizeKB}KB)`)
      } else {
        console.log(`  ❌ MISSING: ${asset}`)
        categoryIssues++
        totalIssues++
      }
    })
    
    if (categoryIssues === 0) {
      console.log(`  ✨ All ${category.toLowerCase()} present!`)
    } else {
      console.log(`  ⚠️ ${categoryIssues} missing ${category.toLowerCase()}`)
    }
  })

  // Check for common problematic file patterns
  console.log('\n🔧 Asset Mapping Issues Check:')
  const problematicPatterns = [
    { pattern: 'sounds/owl-hoot.mp3', suggestion: 'Use sounds/owl.mp3 instead' },
    { pattern: 'sounds/parrot-chirp.mp3', suggestion: 'Use sounds/RedParot.mp3 instead' },
    { pattern: 'sounds/monkey-chatter.mp3', suggestion: 'Use sounds/Kapuzineraffe.mp3 instead' },
    { pattern: 'sounds/elephant-trumpet.mp3', suggestion: 'Use sounds/Elefant.mp3 instead' },
    { pattern: 'sounds/leaf-rustle.mp3', suggestion: 'Use sounds/jungle-wind.mp3 instead' },
    { pattern: 'images/screenshot-wide.png', suggestion: 'Use images/Wordy Jungle Adventure Logo.png instead' }
  ]

  problematicPatterns.forEach(({ pattern, suggestion }) => {
    const fullPath = path.join(publicDir, pattern)
    if (fs.existsSync(fullPath)) {
      console.log(`  ✅ ${pattern} exists`)
    } else {
      console.log(`  ℹ️ ${pattern} not found - ${suggestion}`)
    }
  })

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 ASSET CHECK SUMMARY')
  console.log('='.repeat(60))

  if (totalIssues === 0) {
    console.log('🎉 ALL ASSETS FOUND! Your Wordy Kids app is ready to go!')
    console.log('✅ All required sounds and images are present')
    console.log('✅ Educational features should work perfectly')
  } else {
    console.log(`⚠️ Found ${totalIssues} missing assets`)
    console.log('💡 Recommendations:')
    console.log('   1. Use AssetManager.getAssetPath() for automatic fallbacks')
    console.log('   2. Create missing files or use suggested alternatives')
    console.log('   3. Run this script again after fixing issues')
    console.log('   4. The app will still work with fallbacks, but some sounds may not be optimal')
  }

  console.log('\n🔄 To automatically fix asset paths in your code:')
  console.log('   Import { AssetManager } from "@/lib/assetManager"')
  console.log('   Use: await AssetManager.getAssetPath("/sounds/owl-hoot.mp3")')
  console.log('   This will automatically return "/sounds/owl.mp3"')

  console.log('\n✨ Asset check complete!')
  
  // Exit with appropriate code
  process.exit(totalIssues > 0 ? 1 : 0)
}

// Run asset check if called directly
if (require.main === module) {
  checkAssets()
}

module.exports = { checkAssets }
