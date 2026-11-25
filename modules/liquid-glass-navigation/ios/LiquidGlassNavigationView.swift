import ExpoModulesCore
import SwiftUI
import UIKit

class LiquidGlassNavigationView: ExpoView {
  private let hostingController = UIHostingController(rootView: LiquidGlassSwiftUIView(activeIndex: 0, tabCount: 5, scheme: "system"))

  var activeIndex: Int = 0 {
    didSet {
      updateView()
    }
  }

  var tabCount: Int = 5 {
    didSet {
      updateView()
    }
  }

  var colorScheme: String = "system" {
    didSet {
      updateView()
    }
  }

  private func updateView() {
    hostingController.rootView = LiquidGlassSwiftUIView(
      activeIndex: activeIndex,
      tabCount: tabCount,
      scheme: colorScheme
    )
  }

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = false // allow shadows to bleed

    hostingController.view.backgroundColor = .clear

    // Add hosting controller view as background behind react-native children
    insertSubview(hostingController.view, at: 0)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    hostingController.view.frame = bounds
  }
}

struct LiquidGlassSwiftUIView: View {
  var activeIndex: Int
  var tabCount: Int
  var scheme: String

  var body: some View {
    GeometryReader { geometry in
      let width = geometry.size.width
      let height = geometry.size.height
      let tabWidth = (width - 16) / CGFloat(max(1, tabCount)) // account for 8px padding on each side

      // Absolute geometric center of the target cell to prevent any layout drift
      let cellCenterX = 8 + CGFloat(activeIndex) * tabWidth + tabWidth / 2
      let cellCenterY = height / 2

      ZStack(alignment: .leading) {
        // Main floating container background (Liquid Glass)
        RoundedRectangle(cornerRadius: height / 2, style: .continuous)
          .fill(Color.clear)
          .background(
            ZStack {
              if #available(iOS 15.0, *) {
                RoundedRectangle(cornerRadius: height / 2, style: .continuous)
                  .fill(.ultraThinMaterial)
              } else {
                VisualEffectView(effect: UIBlurEffect(style: scheme == "dark" ? .dark : .light))
                  .clipShape(RoundedRectangle(cornerRadius: height / 2, style: .continuous))
              }
            }
          )
          .overlay(
            RoundedRectangle(cornerRadius: height / 2, style: .continuous)
              .stroke(LinearGradient(
                colors: [Color.white.opacity(scheme == "dark" ? 0.3 : 0.6), Color.white.opacity(0.1)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
              ), lineWidth: 1)
          )
          .shadow(color: Color.black.opacity(scheme == "dark" ? 0.4 : 0.15), radius: 15, x: 0, y: 10)
          .frame(width: width, height: height)

        // Active floating glass lens
        RoundedRectangle(cornerRadius: (height - 16) / 2, style: .continuous)
          .fill(Color.clear)
          .background(
            ZStack {
              if #available(iOS 15.0, *) {
                RoundedRectangle(cornerRadius: (height - 16) / 2, style: .continuous)
                  .fill(.regularMaterial)
                  .opacity(scheme == "dark" ? 0.5 : 0.8)
              } else {
                VisualEffectView(effect: UIBlurEffect(style: .prominent))
                  .clipShape(RoundedRectangle(cornerRadius: (height - 16) / 2, style: .continuous))
                  .opacity(scheme == "dark" ? 0.5 : 0.8)
              }
            }
          )
          .overlay(
            RoundedRectangle(cornerRadius: (height - 16) / 2, style: .continuous)
              .stroke(LinearGradient(
                colors: [Color.white.opacity(scheme == "dark" ? 0.4 : 0.8), Color.white.opacity(0.1)],
                startPoint: .top,
                endPoint: .bottom
              ), lineWidth: 1.5)
          )
          .shadow(color: Color.black.opacity(scheme == "dark" ? 0.3 : 0.1), radius: 5, x: 0, y: 3)
          .frame(width: tabWidth - 12, height: height - 16)
          // Position places the absolute center of the lens directly on the calculated center coordinates
          .position(x: cellCenterX, y: cellCenterY)
          // Premium fluid spring animation
          .animation(.spring(response: 0.4, dampingFraction: 0.75, blendDuration: 0), value: activeIndex)
      }
    }
  }
}

struct VisualEffectView: UIViewRepresentable {
  var effect: UIVisualEffect?
  func makeUIView(context: UIViewRepresentableContext<Self>) -> UIVisualEffectView {
    UIVisualEffectView()
  }
  func updateUIView(_ uiView: UIVisualEffectView, context: UIViewRepresentableContext<Self>) {
    uiView.effect = effect
  }
}
