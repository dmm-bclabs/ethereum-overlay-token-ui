import React from 'react';
import './App.css';
import overlayTokenABI from './OverlayToken.js';
import Web3 from 'web3';

import { Container, Badge, Form, Row, Col, Button } from 'react-bootstrap';

var web3js;
var OverlayToken;

export class App extends React.Component {
  state = {
		token: {
			totalSupply: 0,
			localSupply: 0,
			childSupply: 0
		},
		account: {
			address: '0x0',
			tokenBalance: 0,
			nonce: 0
		},
			mint: {
			amount: 0
		},
		burn: {
			amount: 0
		},
		transfer: {
			address: '0x0',
			amount: 0
		},
		send: {
			chianId: 0,
			amount: 0
		}
  };

    async componentDidMount() {
		if (window.ethereum) {
				web3js = await new Web3(window.ethereum);
				try { 
					await window.ethereum.enable();
				} catch(e) {
				}
		} else if (typeof window.web3 !== 'undefined') {
				web3js = await new Web3(window.web3.currentProvider);
		} else {
			web3js = await new Web3(new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws/v3/"));
		}
		OverlayToken = await new web3js.eth.Contract(overlayTokenABI, "0x81d13559938ef896e4da8c5c13b7d1f4ce1feb27");

		const updateState = this.updateState.bind(this);
		OverlayToken.events.allEvents({fromBlock: 'latest'}, function(error, result) {
			if (!error) {
				updateState();
			}
		});
		updateState();
	}
	
	async updateState() {
		const accounts = await web3js.eth.getAccounts();
		const totalSupply = await OverlayToken.methods.totalSupply().call();
		const localSupply = await OverlayToken.methods.localSupply().call();
		const childSupply = await OverlayToken.methods.childSupply(0).call();
		const balance = await OverlayToken.methods.balanceOf(accounts[0]).call();
		const nonce = await web3js.eth.getTransactionCount(accounts[0]);

		this.setState({
			token: {
				totalSupply: totalSupply.toNumber(),
				localSupply: localSupply.toNumber(),
				childSupply: childSupply.toNumber()
			},
			account: {
				address: accounts[0],
				balance: balance.toNumber(),
				nonce: nonce
			}
		})
	}

  async mint(event) {
		const amount = this.state.mint.amount;
		const address = this.state.account.address;
		await OverlayToken.methods.mint(amount).send({
			from: address
		})
	}

  async burn(event) {
		const amount = this.state.burn.amount;
		const address = this.state.account.address;
		await OverlayToken.methods.burn(amount).send({
			from: address
		})
	}

  async transfer(event) {
		const receiver = this.state.transfer.address;
		const amount = this.state.transfer.amount;
		const address = this.state.account.address;
		await OverlayToken.methods.transfer(receiver, amount).send({
			from: address
		})
	}

  async send(event) {
		const chainId = this.state.send.chainId;
		const amount = this.state.send.amount;
		const address = this.state.account.address;
		await OverlayToken.methods.sendToChild(chainId, amount).send({
			from: address
		})
	}

  async receive(event) {
		const chainId = this.state.send.chainId;
		const amount = this.state.send.amount;
		const address = this.state.account.address;
		await OverlayToken.methods.receiveFromChild(chainId, amount).send({
			from: address
		})
	}

	handleChangeFactory(form, type) {
		var that = this;
		return function(event) {
			var data = {};
			data[form] = that.state[form];
			data[form][type] = event.target.value;
			that.setState(data);
		}
	}
	
  render() {
		const badgeStyle = {
			margin: 3,
			fontWeight: 400
		}
		const valueStyle = {
			fontWeight: 600
		}
			return (
      <div className="App">
        <Container>
					<h1>Overlay Token</h1>
					<h2 style={{color: "gray"}}>between ethereum and substrate</h2>
					<h3><Badge variant="danger">Ropsten</Badge></h3>
					<hr />
					<h3>
						<Badge variant="secondary" style={badgeStyle}>totalSupply: <span style={valueStyle}>{this.state.token.totalSupply}</span></Badge>
						<Badge variant="secondary" style={badgeStyle}>localSupply: <span style={valueStyle}>{this.state.token.localSupply}</span></Badge>
						<Badge variant="secondary" style={badgeStyle}>childSupply: <span style={valueStyle}>{this.state.token.childSupply}</span></Badge>
					</h3>
					<hr />
					<Form>
						<Form.Group controlId="account">
							<Form.Label>Address: </Form.Label>
							<Form.Control type="text" placeholder="0x0" value={this.state.account.address} onChange={this.handleChangeFactory('account', 'address')}  />
						</Form.Group>
					</Form>
					<h3>
						<Badge variant="secondary" style={badgeStyle}>balance: <span style={valueStyle}>{this.state.account.balance}</span></Badge>
						<Badge variant="secondary" style={badgeStyle}>nonce: <span style={valueStyle}>{this.state.account.nonce}</span></Badge>
						</h3>
					<hr />
					<Form>
					<Form.Group  as={Row} controlId="mint">
							<Form.Label column sm="2">Mint: </Form.Label>
							<Col sm="8">
								<Form.Control type="number" placeholder="Token amount" onChange={this.handleChangeFactory('mint', 'amount')} />
							</Col>
							<Col sm="2">
								<Button variant="primary" onClick={this.mint.bind(this)}>
									Mint
								</Button>
							</Col>
						</Form.Group>
						<Form.Group  as={Row} controlId="burn">
							<Form.Label column sm="2">Burn: </Form.Label>
							<Col sm="8">
								<Form.Control type="number" placeholder="Token amount" onChange={this.handleChangeFactory('burn', 'amount')} />
							</Col>
							<Col sm="2">
								<Button variant="primary" onClick={this.burn.bind(this)}>
									Burn
								</Button>
							</Col>
						</Form.Group>
						<Form.Group  as={Row} controlId="transfer">
							<Form.Label column sm="2">Transfer: </Form.Label>
							<Col sm="3">
								<Form.Control type="text" placeholder="Address" onChange={this.handleChangeFactory('transfer', 'address')} />
							</Col>
							<Col sm="5">
								<Form.Control type="number" placeholder="Token amount" onChange={this.handleChangeFactory('transfer', 'amount')} />
							</Col>
							<Col sm="2">
								<Button variant="primary" onClick={this.transfer.bind(this)}>
									Transfer
								</Button>
							</Col>
						</Form.Group>
						<Form.Group  as={Row} controlId="send">
							<Form.Label column sm="2">SendToChild: </Form.Label>
							<Col sm="3">
								<Form.Control type="number" placeholder="Chain ID" onChange={this.handleChangeFactory('send', 'chainId')} />
							</Col>
							<Col sm="5">
								<Form.Control type="number" placeholder="Token amount" onChange={this.handleChangeFactory('send', 'amount')} />
							</Col>
							<Col sm="2">
								<Button variant="primary" onClick={this.send.bind(this)}>
									Send
								</Button>
							</Col>
						</Form.Group>
						<Form.Group  as={Row} controlId="send">
							<Form.Label column sm="2">Receive: </Form.Label>
							<Col sm="3">
								<Form.Control type="number" placeholder="Chain ID" onChange={this.handleChangeFactory('send', 'chainId')} />
							</Col>
							<Col sm="5">
								<Form.Control type="number" placeholder="Token amount" onChange={this.handleChangeFactory('send', 'amount')} />
							</Col>
							<Col sm="2">
								<Button variant="primary" onClick={this.receive.bind(this)}>
									Receive
								</Button>
							</Col>
						</Form.Group>
					</Form>
				</Container>
      </div>
    );
  }
}

class Body extends React.Component {
  render() {
    return <div>
      hello
      </div>
  }
}

export default App;
