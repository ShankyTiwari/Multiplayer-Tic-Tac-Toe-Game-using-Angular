import { Component, Renderer, ViewChild , OnInit } from '@angular/core';
import { AppService } from './app.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	providers: [AppService]
})
export class AppComponent implements OnInit {

	/*
	* Initial Game Variables and constants starts
	*/
	private title = 'Realtime Tic Tac Toe Using Angular 5 & Socket.IO  —  Rooms and Namespaces';
	private gameGrid = <Array<Object>>[];
	private playedGameGrid = <Array<Object>>[];
	private movesPlayed = <number>0;
	private displayPlayerTurn = <Boolean>true;
	private myTurn = <Boolean>true;
	private whoWillStart = <Boolean>true;
	/*
	* Initial Game Variables and constants starts
	*/

	/*Bootstrap modal Options starts*/
	@ViewChild('content') private content;
	private modalOption: NgbModalOptions = {};
	/* Bootstrap modal Options ends */

	/*socket related Variable,ng-models and constant starts*/
	private totalRooms = <Number> 0;
	private emptyRooms = <Array<number>> [];
	private roomNumber = <Number> 0;
	private playedText = <string>'';
	private whoseTurn = 'X';
	/*socket related Variable,ng-models and constant starts*/

	constructor(
		private _renderer: Renderer,
		private modalService: NgbModal,
		private appService: AppService,
	) {
		this.gameGrid = appService.gameGrid;
	}

	ngOnInit() {
		/*Code to display the Modal start*/
		this.modalOption.backdrop = 'static';
		this.modalOption.keyboard = false;
		this.modalOption.size = 'lg';
		const localModalRef = this.modalService.open(this.content, this.modalOption);
		/*Code to display the Modal start*/

		// connect the player to the socket
		this.appService.connectSocket();

		// HTTP call to get Empty rooms and total room numbers
		this.appService.getRoomStats().then(response => {
			this.totalRooms = response['totalRoomCount'];
			this.emptyRooms = response['emptyRooms'];
		});

		// Socket evenet will total available rooms to play.
		this.appService.getRoomsAvailable().subscribe(response => {
			this.totalRooms = response['totalRoomCount'];
			this.emptyRooms = response['emptyRooms'];
		});

		// Socket evenet to start a new Game
		this.appService.startGame().subscribe((response) => {
			localModalRef.close();
			this.roomNumber = response['roomNumber'];
		});

		// Socket event will receive the Opponent player's Move
		this.appService.receivePlayerMove().subscribe((response) => {
			this.opponentMove(response);
		});

		// Socket event to check if any player left the room, if yes then reload the page.
		this.appService.playerLeft().subscribe((response) => {
			alert('Player Left');
			window.location.reload();
		});
	}

	/**
	 * Method to join the new Room by passing Romm Number
	 * @param roomNumber
	 */
	joinRoom(roomNumber) {
		this.myTurn = false;
		this.whoWillStart = false;
		this.whoseTurn = 'O';
		this.appService.joinNewRoom(roomNumber);
	}
	/**
	 * Method create new room
	 */
	createRoom() {
		this.myTurn = true;
		this.whoseTurn = 'X';
		this.whoWillStart = true;
		this.appService.createNewRoom().subscribe( (response) => {
			this.roomNumber = response.roomNumber;
		});
	}

	/**
	 * This method will be called by the socket event subscriber to make the Opponent players moves
	 * @param params
	 */
	opponentMove(params) {
		this.displayPlayerTurn = !this.displayPlayerTurn ? true : false;
		if (params['winner'] ===  null) {
			this.playedGameGrid[params['position']] = {
				position: params['position'],
				player: params['playedText']
			};
			this.myTurn = true;
		}else {
			alert(params['winner']);
			this.resetGame();
		}
	}

	/**
	 * This method will be called when the current user tries to play his/her move
	 * Also we will send the socket event to the server.
	 * @param number
	 */
	play(number) {
		if (!this.myTurn) {
			return;
		}
		this.movesPlayed += 1;
		this.playedGameGrid[number] = {
			position: number,
			player: this.whoseTurn
		};
		this.appService.sendPlayerMove({
			'roomNumber' : this.roomNumber,
			'playedText': this.whoseTurn,
			'position' : number,
			'playedGameGrid': this.playedGameGrid,
			'movesPlayed' : this.movesPlayed
		});
		this.myTurn = false;
		this.displayPlayerTurn = !this.displayPlayerTurn ? true : false;
	}
	/**
	 * This method will be used to render the data between the Grids.
	 * @param number
	 */
	renderPlayedText(number) {
		if (this.playedGameGrid[number] === undefined) {
			return '';
		}else {
			this.playedText = this.playedGameGrid[number]['player'];
			return this.playedText;
		}
	}
	/**
	 * As the name suggests here in this method we will reset the game.
	 */
	resetGame() {
		this.playedGameGrid = [];
		this.gameGrid = [];
		this.gameGrid = this.appService.gameGrid;
		this.movesPlayed = 0;
		if (this.whoWillStart) {
			this.myTurn = true;
			this.displayPlayerTurn = true;
			this.whoseTurn = 'X';
		}else {
			this.displayPlayerTurn = true;
			this.whoseTurn = 'O';
		}
	}
}