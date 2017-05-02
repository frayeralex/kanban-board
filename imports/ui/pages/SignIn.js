import React from 'react';
import Alert from 'react-s-alert';

export default class SignIn extends React.Component{
    constructor(props) {
        super(props);
    }

    messageWarn(message = 'Invalid data!'){
        Alert.warning(message, {
            position: 'top',
            effect: 'bouncyflip',
            timeout: 5000
        })
    }

    login(event){
        event.preventDefault();

        const pass = this.pass.value;
        const username = this.username.value;

        if(!username) return this.messageWarn('Enter username');
        if(!pass) return this.messageWarn('Enter password');

        Meteor.loginWithPassword({username}, pass, (err)=>{
            if(err) return this.messageWarn();
            FlowRouter.reload();
        });
    }

    render() {

        return (
            <div className="sign-in">
                <div className="form-wrap">
                    <form onSubmit={this.login.bind(this)}>
                        <div className="field-wrap">
                            <label htmlFor="username">Username</label>

                            <input ref={ref=>this.username = ref}
                                   id="username"
                                   className="default"
                                   type="text"/>
                        </div>

                        <div className="field-wrap">
                            <label htmlFor="pass">Password</label>

                            <input ref={ref=>this.pass = ref}
                                   id="pass"
                                   className="default"
                                   type="password"/>

                        </div>
                        <button className="main-btn">Ok</button>
                    </form>
                </div>
                <Alert stack={{limit: 1}} />
            </div>
        )
    }
}