import { Component, Frame, RouterLink, RouterView } from "movijs";
import "./style.scss"; 
import { ShellController } from "./authModels";
export default class AuthPage extends Component {

    constructor() {
        super('div'); 

        ShellController.loadShelData();
    }
   
    view() {
        return <RouterView></RouterView>
    }


}