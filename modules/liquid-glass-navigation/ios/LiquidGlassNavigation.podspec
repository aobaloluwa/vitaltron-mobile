Pod::Spec.new do |s|
  s.name           = 'LiquidGlassNavigation'
  s.version        = '1.0.0'
  s.summary        = 'A premium iOS Liquid Glass navigation module'
  s.description    = 'Provides native iOS liquid glass navigation effects for Expo'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '13.0' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
