import React, { Component } from 'react'
import { Route, withRouter } from 'react-router-dom'

import AsyncComponent from './AsyncComponent'
import NotificationResource from '../resources/NotificationResource'
import './app.css'

const loadLogin = () => {
  return import('./LoginContainer').then(module => module.default)
}

const loadChat = () => {
  return import('./ChatContainer').then(module => module.default)
}

const loadUser = () => {
  return import('./UserContainer').then(module => module.default)
}

const LoginContainer = AsyncComponent(loadLogin);
const ChatContainer = AsyncComponent(loadChat);
const UserContainer = AsyncComponent(loadUser);

class App extends Component {
  state = {
    user: null,
    messages: [],
    messagesLoaded: false,
  }

  componentDidMount() {
    this.notifications = new NotificationResource(firebase.messaging(), firebase.database())
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user })
        this.listenForMessages()
        this.notifications.changeUser(user)
      } else {
        this.props.history.push('/login')
      }
    })
    this.listenForMessages()
    this.listenForInstallBanner()
    loadChat()
    loadLogin()
    loadUser()
  }

  listenForMessages = () => {
    firebase
      .database()
      .ref('/messages')
      .on('value', (snapshot) => {
        this.onMessage(snapshot)
        if (!this.state.messagesLoaded) {
          this.setState({ messagesLoaded: true })
        }
      })
  }

  listenForInstallBanner = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt event fired')
      e.preventDefault()
      this.deferredPrompt = e
    })
  }

  onMessage = (snapshot) => {
    const messages = Object.keys(snapshot.val()).map((key) => {
      const msg = snapshot.val()[key]
      msg.id = key;
      return msg
    })
    this.setState({ messages })
  }

  handleSubmitMessage = (msg) => {
    const data = {
      msg,
      author: this.state.user.email,
      user_id: this.state.user.uid,
      timestamp: Date.now(),
    }

    firebase.database().ref('messages/').push(data)

    if (this.deferredPrompt) {
      this.deferredPrompt.prompt()
      this.deferredPrompt.userChoice.then((choice) => {
        console.log(choice)
      })
      this.deferredPrompt = null
    }
  }

  render() {
    return (
      <div id="container" className="inner-container">
        <Route path="/login" component={LoginContainer} />
        <Route
          exact
          path="/"
          render={() =>
            <ChatContainer
              onSubmit={this.handleSubmitMessage}
              messages={this.state.messages}
              user={this.state.user}
              messagesLoaded={this.state.messagesLoaded} />
          } />
        <Route
          path="/users/:id"
          render={({ history, match }) =>
            <UserContainer
              messages={this.state.messages}
              messagesLoaded={this.state.messagesLoaded}
              userID={match.params.id} />
        } />
      </div>
    )
  }
}

export default withRouter(App)
