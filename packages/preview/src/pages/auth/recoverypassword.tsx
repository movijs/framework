import { Component, Frame, RouterLink, RouterView } from "movijs";
import "./style.scss";
import { UserModel } from "../../model/user";
import { ShellController } from "./authModels";
export default class RecoveryPasswordPage extends Component {

    constructor() {
        super('div');
        this.class.add('lightbox-cover');
    }

    view() {
        return <div>

            <div scope="target_section_name"></div>
            <div>
                <div>
                    <h1 class="display-6 text-left">{ShellController.t('lbl.paswordEntry', 'Parolanızı Girin')}</h1>
                    <span class="btn btn-link" onClick={() => {

                    }}>&#x2190;  </span>
                </div>
                <div>

                    <div class="mb-3" >
                        <label for="exampleFormControlInput1" class="form-label">{ShellController.t('lbl.password', 'Parola')}</label>
                        <input onstaged={(s) => {   }} type="email" class="form-control" id="exampleFormControlInput1" onkeyup={(e) => { if (e.key == 'Enter') { } }} />
                    </div>
                </div>
                 
                <div class="d-flex justify-content-end">
                    <button type="submit" class="btn btn-primary" onClick={() => {
                        // UserModel.loginState = true;
                        // this.context.navigate(UserModel.redirectUri)
                    }}>İleri</button>
                </div>
            </div>
        </div>
    }


}