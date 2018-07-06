import Header from './Header'
import Main from './Main'
import React, { Component } from 'react';
import imgAvatar from '../../img/avatar-default.png';

/**
 * Class representing the highest order component. Any user
 * updates in child components should trigger an event in this
 * class so that the current user details can be re-fetched from
 * the contract and propagated to all children that rely on it
 * 
 * @extends React.Component
 */
class App extends Component {

  //#region Constructor
  constructor(props) {
    super(props);

    this.state = {
      user: {}
    }
  }
  //#endregion

  //#region Helper methods
  /**
   * Loads user details from the contract based on the current
   * account (address).
   * 
   * First, the owners mapping is queried using the owner address key. It returns
   * the hash of the username it maps to. This username hash is then used to query
   * the users mapping in the contract to get the details of the user. Once the user
   * details are returned, the state is updated with the details, which triggers a
   * render in this component and all child components.
   * 
   * @returns {null}
   */
  _loadCurrentUser = async () => {
    const accounts = await web3.eth.getAccounts();
    try {
      const usernameHash = await DTwitter.methods.owners(accounts[0]).call();
      if (usernameHash) {
        // get user details from contract
        const user = await DTwitter.methods.users(usernameHash).call();

        // update user picture with ipfs url
        user.picture = user.picture.length > 0 ? EmbarkJS.Storage.getUrl(user.picture) : imgAvatar;

        // update state with user details
        return this.setState({ user: user, account: accounts[0] });
      }
    }
    catch (err) {
      console.error('Error loading currenet user: ', err);
    }
  }
  //#endregion

  //#region React lifecycle events
  componentDidMount() {
    EmbarkJS.onReady(() => {
      setTimeout(() => { this._loadCurrentUser(); }, 0);
    });
  }

  render() {
    return (
      <div>
        <Header user={ this.state.user } account={ this.state.account } />
        <Main user={ this.state.user } account={ this.state.account } onAfterUserUpdate={ (e) => this._loadCurrentUser() } />
      </div>
    );
  }
  //#endregion
}

export default App