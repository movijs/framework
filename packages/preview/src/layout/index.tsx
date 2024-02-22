import { Component, MoviComponent, RouterView } from "movijs";
import { LayoutViewModel } from "./view.model";
import view from "./view";
export default class MainLayout extends Component  {
   
    view() { 
        return <div class={this.context.state.ui.theme}> 
            <RouterView onconfig={(s) => {
                s.options.transition.name = 'fade'
            }}></RouterView>
        </div>
    }
}
