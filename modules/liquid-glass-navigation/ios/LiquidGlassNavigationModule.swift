import ExpoModulesCore

public class LiquidGlassNavigationModule: Module {
  public func definition() -> ModuleDefinition {
    Name("LiquidGlassNavigation")

    View(LiquidGlassNavigationView.self) {
      Prop("activeIndex") { (view: LiquidGlassNavigationView, index: Int) in
        view.activeIndex = index
      }

      Prop("tabCount") { (view: LiquidGlassNavigationView, count: Int) in
        view.tabCount = count
      }

      Prop("colorScheme") { (view: LiquidGlassNavigationView, scheme: String) in
        view.colorScheme = scheme
      }
    }
  }
}
