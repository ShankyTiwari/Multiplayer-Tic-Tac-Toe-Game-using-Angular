/* 
* @author Shashank Tiwari
* Multiplayer Tic-Tac-Toe Game using Angular, Nodejs
*/
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

/* Importing from rxjs library starts*/
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
/* Importing from rxjs library ends*/

import * as io from 'socket.io-client';

@Injectable()
export class AppService {
	/* Const and variable for Tic Tac Toe Game starts. */
	public gameGrid = <Array<Object>>[[1, 2, 3], [4, 5, 6], [7, 8, 9]];
	/* Const and variable for Tic Tac Toe Game ends.*/
	/* Const and variable for SocketEvent and HTTP call starts. */
	private BASE_URL = 'http://localhost:4000';
	public socket;
	private headerOptions = new RequestOptions({
		headers: new Headers({ 'Content-Type': 'application/json;charset=UTF-8' })
	});
	/* Const and variable for SocketEvent and HTTP call ends. */
	constructor(private http: HttpClient) {}

	/**
	 * This method will call the HTTP request to get the Total room count and Available rooms to play
	 */
	public getRoomStats() {
		return new Promise(resolve => {
			this.http.get(`http://localhost:4000/getRoomStats`).subscribe(data => {
				resolve(data);
			});
		});
	}
	/*
	* Method to connect the users to socket
	*/
	connectSocket() {
		this.socket = io(this.BASE_URL);
	}
	/* Method to receive rooms-available event.*/
	getRoomsAvailable(): any {
		const observable = new Observable(observer => {
			this.socket.on('rooms-available', (data) => {
				observer.next(
					data
				);
			});
			return () => {
				this.socket.disconnect();
			};
		});
		return observable;
	}
	/* Method to create new room, create-room event.*/
	createNewRoom(): any {
		this.socket.emit('create-room', { 'test': 9909 });
		const observable = new Observable(observer => {
			this.socket.on('new-room', (data) => {
				observer.next(
					data
				);
			});
			return () => {
				this.socket.disconnect();
			};
		});
		return observable;
	}
	/* Method to join new room, create-room event.*/
	joinNewRoom(roomNumber): any {
		this.socket.emit('join-room', { 'roomNumber': roomNumber });
	}
	/* Method to receive start-game event.*/
	startGame(): any {
		const observable = new Observable(observer => {
			this.socket.on('start-game', (data) => {
				observer.next(
					data
				);
			});
			return () => {
				this.socket.disconnect();
			};
		});
		return observable;
	}
	/* Method to join new room, create-room event.*/
	sendPlayerMove(params): any {
		this.socket.emit('send-move', params);
	}
	/* Method to receive start-game event.*/
	receivePlayerMove(): any {
		const observable = new Observable(observer => {
			this.socket.on('receive-move', (data) => {
				observer.next(
					data
				);
			});
			return () => {
				this.socket.disconnect();
			};
		});
		return observable;
	}
	/* Event to check the if any player is leaving the game */
	playerLeft(): any {
		const observable = new Observable(observer => {
			this.socket.on('room-disconnect', (data) => {
				observer.next(
					data
				);
			});
			return () => {
				this.socket.disconnect();
			};
		});
		return observable;
	}
}
