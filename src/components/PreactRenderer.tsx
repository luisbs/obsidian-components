import { MarkdownRenderChild } from 'obsidian'
import { h, render } from 'preact'
import { unmountComponentAtNode } from 'preact/compat'
import { PluginContext, SettingsContext } from '@/utility/ui'

export default class PreactRenderer extends MarkdownRenderChild {
  public constructor(
    public context: PluginContext,
    public component: h.JSX.Element,
  ) {
    super(context.containerEl)
  }

  public onload(): void {
    render(
      <SettingsContext.Provider value={this.context}>
        {this.component}
      </SettingsContext.Provider>,
      this.containerEl,
    )
  }

  public onunload(): void {
    unmountComponentAtNode(this.containerEl)
  }
}
