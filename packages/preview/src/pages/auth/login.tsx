import { Component, Frame, RouterLink } from "movijs";
import "./style.scss";
import { UserModel } from "../../model/user";
import { ContentBlock, ContentBody } from "../../components/ContentBlock";
import { ShellController } from "./authModels";
export default class LoginPage extends Component {
    state = this.useModel({
        userName: 'ekremersahin@outlook.com',
        password: '',
        error: '',
        helpers: [],
        wait: false,
        tfaRequired: false
    })
    constructor() {
        super('div');
        this.emailEntry = this.emailEntry.bind(this);
        this.paswordEntry = this.paswordEntry.bind(this);
        //this.settings = { transition: { name: 'fade' } };
        //this.hide();
        this.context.route.params['id']
        this.class.add('lightbox-cover');
        console.error(ShellController);
    }
    onconfig(sender) {
        // this.bind.display(() => {
        //     return this.state.display
        // })
    }
    async checkEmail() {
        this.state.wait = true;
        if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(this.state.userName)) {
            UserModel.checkUser(this.state.userName).then(d => {
                this.state.wait = false;

                if (d.state) {
                    this.state.error = '';
                    this.frame.settings.transition.name = 'fade';
                    this.state.helpers = d.result.helpers;
                    this.frame.navigate(this.paswordEntry());
                } else {
                    this.state.error = d.message;
                    this.state.helpers = d.result.helpers;
                    this.state.tfaRequired = true; //d.result.tfaRequired;
                };
            }).catch(x => {
                this.state.wait = false;

            });

        } else {
            this.state.helpers = [];
            this.state.error = 'E-Posta adresiniz geçerli değil';
            this.state.wait = false;
            // this.frame.settings.transition.name = 'fade';
            // this.frame.navigate(this.paswordEntry())
        }

    }
    emailEntry() {
        var self = this;
        return <div>
            <div >
                <div>
                    <h1 class="display-6 text-left">Oturum Aç</h1>
                    <span>Uygulama sayfasına devam et</span>
                </div>
                <div>


                    <div class="mb-3" >
                        <label for="exampleFormControlInput1" class="form-label">User Name or E-mail</label>
                        <input
                            type="email"
                            class="form-control"
                            id="exampleFormControlInput1"
                            placeholder=""
                            onstaged={(s) => { this.focusElement = s; }}
                            onInput={(e, s) => {
                                this.state.userName = e.target.value;
                            }}
                            value={() => {
                                return this.state.userName;
                            }}
                            onkeyup={(e) => {
                                if (e.key == 'Enter') {
                                    this.checkEmail();
                                }
                            }} />
                    </div>

                </div>
                <div>
                    Hesabınız yok mu? <RouterLink to="/">bir tane oluştur</RouterLink>
                </div>
                <div>
                    <RouterLink to="/">bir güvenlik anahtarı ile oturum açın</RouterLink>
                </div>

                {() => this.getHelpers()}

                <div class="d-flex justify-content-end">
                    <button disabled={() => this.state.wait} type="submit" class="btn btn-primary" onClick={() => {
                        this.checkEmail();
                    }}>
                        <span x-display={() => this.state.wait} class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                        <span role="status"> {ShellController.t('btn.next', 'Sonraki')}</span>

                    </button>
                </div>
            </div>
        </div>
    }

    focusElement;
    paswordEntry() {

        return <div>

            <div scope="target_section_name"></div>
            <div>
                <div>
                    <h1 class="display-6 text-left">{ShellController.t('lbl.paswordEntry', 'Parolanızı Girin')}</h1>
                    <span class="btn btn-link" onClick={() => {
                        this.frame.settings.transition.name = 'fade2';
                        this.frame.navigate(this.emailEntry())
                    }}>&#x2190; {this.state.userName}</span>
                </div>
                <div>

                    <div class="mb-3" >
                        <label for="exampleFormControlInput1" class="form-label">{ShellController.t('lbl.password', 'Parola')}</label>
                        <input onstaged={(s) => { this.focusElement = s; }} type="email" class="form-control" id="exampleFormControlInput1" onkeyup={(e) => { if (e.key == 'Enter') { } }} />
                    </div>
                </div>
                {() => this.getHelpers()}
                <div class="d-flex justify-content-end">
                    <button type="submit" class="btn btn-primary" onClick={() => {
                        // UserModel.loginState = true;
                        // this.context.navigate(UserModel.redirectUri)
                    }}>
                        <span x-display={() => this.state.wait} class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                        <span role="status"> {ShellController.t('btn.next', 'İleri')}</span>
                    </button>
                </div>
            </div>
        </div>
    }
    frame
    usePassword() {
        this.frame.navigate(<div>
            <div>
                <h1 class="display-6 text-left">Hesap Doğrulama</h1>
                <span>Uygulama sayfasına devam et</span>
            </div>
            <div>

                <div class="mb-3" >
                    <label for="exampleFormControlInput1" class="form-label">Parolanız</label>
                    <input onstaged={(s) => { this.focusElement = s; }} type="email" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com" onkeyup={(e) => { if (e.key == 'Enter') { this.frame.settings.transition.name = 'fade2'; this.frame.navigate(this.emailEntry()) } }} />
                </div>


            </div>
            {this.getHelpers}
            <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-primary" onClick={() => {
                    UserModel.loginState = true;
                    this.context.navigate(UserModel.redirectUri)
                }}>
                    <span x-display={() => this.state.wait} class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                    <span role="status"> {ShellController.t('btn.next', 'İleri')}</span>
                </button>
            </div>
        </div>);
    }
    useRecoveryCode() { }

    getHelpers() {
        return <div>
            {this.state.error != '' && <div class="alert alert-danger" settings={{ transition: { name: 'fade' } }}>{this.state.error}</div>}
            {
                this.state.helpers.map(h => {
                    if (h.redirectType == 1) {
                        return <button class="btn btn-link" onClick={(e) => {
                            this.context.navigate(h.redirectUrl);
                        }}>
                            <span>{h.title}</span>
                        </button>
                    } else if (h.redirectType == 4) {
                        return <button class="btn btn-link" onClick={(e) => {
                            this[h.redirectUrl]();
                            return false;
                        }}>
                            <span>{h.title}</span>
                        </button>
                    }
                    return <div></div>
                })}</div>


    }
    view() {
        const EmailEntry = this.emailEntry;

        return <div>
            <div x-ref={this.frame} settings={{ transition: { name: 'fade2' } }} onstaged={() => { this.focusElement.element.focus(); }}> <EmailEntry></EmailEntry></div>



        </div>
    }


}