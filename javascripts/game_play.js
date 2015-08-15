	var canvas=document.getElementById("gameConsole");
	var ctx=canvas.getContext("2d");
	var CANVAS_WIDTH = 550;
	var CANVAS_HEIGHT = 625;
	var PLAY_AREA_WIDTH = 350;
	var PLAY_AREA_HEIGHT = 625;
	var BRICK_SIZE = 25;
	
	var score = 0;
	var level = 0;
	var highScore = 0;
	var linesCleared = 0;
	var nextPiece = 0;
	var currentPiece = 0;
	var curPieceIndex=0;
	var nextPieceIndex=0;
	var rotationIndex=0
	var board = new Array(26); 
	var SQUARE_PIECE=[0x0660];
	var REG_Z_PIECE=[0x06C0, 0x0462, 0x0360, 0x4620];
	var INV_Z_PIECE=[0x0630, 0x2640, 0x0C60, 0x0264];
	var I_PIECE=[0x0F00, 0x4444, 0x00F0, 0x2222];
	var T_PIECE=[0x04E0, 0x0262, 0x0720, 0x4640];
	var REG_L_PIECE=[0x6440, 0x08E0, 0x0226, 0x0710];
	var INV_L_PIECE=[0x6220, 0x0E80, 0x0446, 0x0170];
	var pieces=[SQUARE_PIECE, REG_Z_PIECE, INV_Z_PIECE, I_PIECE, T_PIECE, REG_L_PIECE, INV_L_PIECE];
	var levelScores=[200, 400, 600, 800, 1000];
	var SCORE_INCREMENT=10;
	var BONUS_INCREMENT=15;
	var levelSpeed=500;
	
	var boardColor = '#A0A0A0';
	var blocksColor = '#000000';
	var splitLinesColor = '#D0D0D0';
	var blockCurX = 5;
	var blockCurY = 21;
	var timer;
	
	var menuScreen = false;
	var controlsScreen = false;
	var selectedMenu = 0;
	var gamePaused = false;
	var startMenu=["Start New Game", "Controls"];
	var pauseMenu=["Resume", "Start New Game"];
	var currentMenu = startMenu;
	var img_pattern;
	
	function init(){
		ctx.translate(0, CANVAS_HEIGHT); // Move the origin to bottom left
		window.addEventListener('keydown',doKeyDown,true);
		
		// Event listener for swipe
		swipedetect(canvas, function(swipedir, startX, startY){
			if (swipedir =='left')
				leftAction();
			else if(swipedir =='right')
				rightAction();
			else if(swipedir =='down')
				downAction();
			else if(swipedir == 'up')
				upAction();
			else
				alert('x=' + startX + ', y=' + startY);
		});
		
		window.addEventListener("resize", onResize, false); 
		window.addEventListener('orientationchange', onResize, false);
		onResize();
		window.onblur=pauseGame;
		showMenu(selectedMenu, startMenu);
	}
	
	function showMenu(selectedItem, menu){
		menuScreen = true;
		controlsScreen = false;
		currentMenu=menu;
		// Display the background Image
		var background = new Image();
		background.src = 'images/bricks_bg2.jpg'; 
		background.onload = function(){
			img_pattern = ctx.createPattern(this, "repeat");
			ctx.fillStyle = img_pattern;
			ctx.rect(0, 0, CANVAS_WIDTH, -CANVAS_HEIGHT);
			ctx.fill();
			
			// Display Menu Items
			//ctx.font = '30pt Colonna MT';
			ctx.font = '30pt MenuFont';
			ctx.textAlign = 'center';
			ctx.fillStyle = 'yellow';
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.shadowBlur = 0;
			
			if(selectedItem==0){
				ctx.shadowOffsetX = 5;
				ctx.shadowOffsetY = 5;
				ctx.shadowBlur = 10;
				//ctx.shadowColor = "DarkGoldenRod";
				ctx.shadowColor = "yellow";
			}
			ctx.fillText(menu[0], CANVAS_WIDTH/2, -CANVAS_HEIGHT/2-50);
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.shadowBlur = 0;
			
			if(selectedItem==1){
				ctx.shadowOffsetX = 5;
				ctx.shadowOffsetY = 5;
				ctx.shadowBlur = 10;
				//ctx.shadowColor = "DarkGoldenRod";
				ctx.shadowColor = "yellow";
			}
			ctx.fillText(menu[1], CANVAS_WIDTH/2, -CANVAS_HEIGHT/2+50);
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.shadowBlur = 0;
			
		};
	}
	
	function showControls(){ // Display the controls page
		controlsScreen = true;
		ctx.fillStyle = img_pattern;
		ctx.rect(0, 0, CANVAS_WIDTH, -CANVAS_HEIGHT);
		ctx.fill();
		
		// Draw Border rectangle
		ctx.beginPath();
		ctx.strokeStyle = 'yellow';
		ctx.lineWidth = 3;
		var gradient=ctx.createLinearGradient(0,0,0,-CANVAS_HEIGHT);
		ctx.rect(50,-50, CANVAS_WIDTH-100, -CANVAS_HEIGHT+100);
		//ctx.fillStyle = '#3c170f';
		gradient.addColorStop(0,'#2b170A');
		gradient.addColorStop(1,'#5E3E0f');
		ctx.fillStyle = gradient;
		ctx.fill();
		ctx.stroke();
		
		ctx.textAlign = 'left';
		ctx.fillStyle = 'yellow';
		ctx.shadowOffsetX = 3;
		ctx.shadowOffsetY = 3;
		ctx.shadowBlur = 0;
		ctx.shadowColor = "black";
		ctx.font = '25pt MenuFont';
		ctx.fillText("Controls", 70, -CANVAS_HEIGHT+125);
		ctx.font = '15pt Comic Sans MS';
		ctx.fillText("Move Left : Left Arrow/Swipe Left", 100, -CANVAS_HEIGHT+200);
		ctx.fillText("Move Right : Right Arrow/Swipe Right", 100, -CANVAS_HEIGHT+275);
		ctx.fillText("Move Down : Down Arrow/Swipe Down", 100, -CANVAS_HEIGHT+350);
		ctx.fillText("Rotate : Up Arrow/Tap", 100, -CANVAS_HEIGHT+425);
		ctx.fillText("Pause : ESC Key/Pause Button", 100, -CANVAS_HEIGHT+500);
		
	}
	
	function writeHighScoreToCookie(){
		var now = new Date();
        now.setMonth( now.getMonth() + 1 );
        var cookievalue = escape(score) + ";";
		document.cookie="hiscore=" + cookievalue;
        document.cookie = "expires=" + now.toUTCString() + ";";
	}
	
	function getHighScoreFromCookie(){
		var allcookies = document.cookie;
		// Get the cookies pairs in an array
		var cookiearray = allcookies.split(';');
         
		// Now take key value pair out of this array
		for(var i=0; i<cookiearray.length; i++){
			var name = String(cookiearray[i].split('=')[0]);
			name = name.trim();
			value = cookiearray[i].split('=')[1];
			if(name=='hiscore'){
				highScore=value;
			}
		}
	}
	
	function gameOver(){ // Show the game over screen with score details
		controlsScreen = true;
		ctx.fillStyle = img_pattern;
		ctx.rect(0, 0, CANVAS_WIDTH, -CANVAS_HEIGHT);
		ctx.fill();
		
		// Draw Border rectangle
		ctx.beginPath();
		ctx.strokeStyle = 'yellow';
		ctx.lineWidth = 3;
		var gradient=ctx.createLinearGradient(0,0,0,-CANVAS_HEIGHT);
		ctx.rect(50,-50, CANVAS_WIDTH-100, -CANVAS_HEIGHT+100);
		//ctx.fillStyle = '#3c170f';
		gradient.addColorStop(0,'#2b170A');
		gradient.addColorStop(1,'#5E3E0f');
		ctx.fillStyle = gradient;
		ctx.fill();
		ctx.stroke();
		
		if(score>highScore)
			writeHighScoreToCookie();
		
		ctx.textAlign = 'left';
		ctx.fillStyle = 'yellow';
		ctx.shadowOffsetX = 3;
		ctx.shadowOffsetY = 3;
		ctx.shadowBlur = 0;
		ctx.shadowColor = "black";
		ctx.font = '25pt MenuFont';
		ctx.fillText("Game Over...", 70, -CANVAS_HEIGHT+125);
		ctx.font = '15pt Comic Sans MS';
		ctx.fillText("Score : " + score, 100, -CANVAS_HEIGHT+200);
		ctx.fillText("Lines Cleared : " + linesCleared, 100, -CANVAS_HEIGHT+275);
		ctx.fillText("Level : " + level, 100, -CANVAS_HEIGHT+350);
		ctx.fillText("Your High Score : " + highScore, 100, -CANVAS_HEIGHT+425);
	}
	
	function paint(){
		clear();
		drawConsole();
	}
	
	function clear(){
		ctx.clearRect(0, 0, CANVAS_WIDTH, -CANVAS_HEIGHT);
	}
	
	function initModel(){
		// Only the LSB 16 bits are used, initialize only that as desired
		board[0]=0xFFFF; // Bottom hidden layer
		for(i = 1; i < board.length; i++){
			board[i]=0x8001; // hidden outer boundary on left and right
		}
		nextPiece=0x0000;
		
		// Set the scores and level to 0
		score = 0;
		level = 0;
		linesCleared = 0;
		levelSpeed=500;
		getHighScoreFromCookie();// load the high score from cookie
	}
	
	function drawConsole(){ // Creates the game console with play area, next piece, score, etc
		
		// Draw the play area border
		ctx.lineWidth = 3;
		ctx.strokeStyle = '#000000';
		ctx.beginPath();
		ctx.rect(0, 0, PLAY_AREA_WIDTH, -PLAY_AREA_HEIGHT);
		ctx.fillStyle=boardColor;
		ctx.fill(); 
		ctx.stroke();
		
		ctx.strokeStyle=splitLinesColor;
		ctx.lineWidth = 1;		
		
		// Draw the vertical lines - Play Area
		for(i=1; i<14;i++)
		{
			ctx.beginPath();
			ctx.moveTo(i*BRICK_SIZE, 0);
			ctx.lineTo(i*BRICK_SIZE, -PLAY_AREA_HEIGHT);
			ctx.stroke();
		}
		
		// Draw the horizontal lines - Play Area
		for(i=1;i<25;i++)
		{
			ctx.beginPath();
			ctx.moveTo(0, -i*BRICK_SIZE);
			ctx.lineTo(PLAY_AREA_WIDTH, -i*BRICK_SIZE);
			ctx.stroke();
		}
		
		// Draw the next piece area
		ctx.fillStyle = '#000000';
		ctx.font="Bold Italic 15px Verdana";
		ctx.fillText("Next:",PLAY_AREA_WIDTH+50,-(PLAY_AREA_HEIGHT-45));
		
		ctx.beginPath();
		ctx.strokeStyle = '#000000';
		ctx.fillStyle=boardColor;
		ctx.rect(PLAY_AREA_WIDTH+50,-(PLAY_AREA_HEIGHT-50-BRICK_SIZE*4), BRICK_SIZE*4, -BRICK_SIZE*4);
		ctx.fill(); 
		ctx.stroke();
		
		ctx.strokeStyle=splitLinesColor;
		// Draw the vertical lines - Next Piece
		for(i=1; i<4;i++)
		{
			ctx.beginPath();
			ctx.moveTo(PLAY_AREA_WIDTH+50+i*BRICK_SIZE, -(PLAY_AREA_HEIGHT-50-BRICK_SIZE*4));
			ctx.lineTo(PLAY_AREA_WIDTH+50+i*BRICK_SIZE, -(PLAY_AREA_HEIGHT-50));
			ctx.stroke();
		}
		
		// Draw the vertical lines - Next Piece
		for(i=1; i<4;i++)
		{
			ctx.beginPath();
			ctx.moveTo(PLAY_AREA_WIDTH+50, -(PLAY_AREA_HEIGHT-50-BRICK_SIZE*4+i*BRICK_SIZE));
			ctx.lineTo(PLAY_AREA_WIDTH+50+BRICK_SIZE*4, -(PLAY_AREA_HEIGHT-50-BRICK_SIZE*4+i*BRICK_SIZE));
			ctx.stroke();
		}
		
		// Score
		ctx.fillStyle = '#000000';
		ctx.font="Bold Italic 18px Ariel";
		ctx.fillText("Score:",PLAY_AREA_WIDTH+50,-(PLAY_AREA_HEIGHT-BRICK_SIZE*9));
		// ctx.font="20px Digital";
		ctx.fillText(score,PLAY_AREA_WIDTH+50+55,-(PLAY_AREA_HEIGHT-BRICK_SIZE*9));
		
		// Level
		ctx.fillStyle = '#000000';
		ctx.font="Bold Italic 18px Ariel";
		ctx.fillText("Level:",PLAY_AREA_WIDTH+50,-(PLAY_AREA_HEIGHT-BRICK_SIZE*11));
		// ctx.font="18px Digital";
		ctx.fillText(level,PLAY_AREA_WIDTH+50+55,-(PLAY_AREA_HEIGHT-BRICK_SIZE*11));
	}
	
	function updateConsole(blockColor){ // Updates the game console with the model data (game progress, score, level)
				
		// Read each bit and plot the board with the current status
		for(i=1;i<board.length;i++){ // skipped 0, as its bottom hidden
			var bitMask=0x4000; // skip hidden first left
			for(j=1;j<15;j++){
				var bitSet = bitMask & board[i];
				bitMask = bitMask>>1;
				
				if(bitSet!=0){ // The bit is set, set the brick to on in the board
					ctx.fillStyle=blockColor;
					ctx.strokeStyle=splitLinesColor;
					ctx.lineWidth=1;
					ctx.beginPath();
					ctx.rect((j-1)*BRICK_SIZE, -(i-1)*BRICK_SIZE, BRICK_SIZE, -BRICK_SIZE);
					ctx.fill(); 
					ctx.stroke();
				}
			}
		}
		
		drawNextBlock(blockColor); // Draw the next block data
		
		// Clear the score and level area
		ctx.fillStyle='#FFFFFF';
		ctx.beginPath();
		ctx.rect(PLAY_AREA_WIDTH+50+40,-(PLAY_AREA_HEIGHT-BRICK_SIZE*8),200,200);
		ctx.fill(); 
		
		// Update the score
		ctx.fillStyle = '#000000';
		ctx.font="Bold Italic 18px Ariel";
		ctx.fillText(score,PLAY_AREA_WIDTH+50+55,-(PLAY_AREA_HEIGHT-BRICK_SIZE*9));
		
		// Update the level
		ctx.fillText(level,PLAY_AREA_WIDTH+50+55,-(PLAY_AREA_HEIGHT-BRICK_SIZE*11));
	}
	
	function drawNextBlock(blockColor){ // Color used to clear existing/draw new block
		// Update the next piece with model data
		var bitMask=0x8000;
		var y=0;
		for(i=0;i<16;i++){
			var bitSet = bitMask & nextPiece;
			if(bitSet!=0){ // Check for the set bit in the next piece and set the respective brick
				ctx.fillStyle=blockColor;
				ctx.strokeStyle=splitLinesColor;
				ctx.lineWidth=1;
				ctx.beginPath();
				ctx.rect(PLAY_AREA_WIDTH+50+(i%4)*BRICK_SIZE, -(PLAY_AREA_HEIGHT-50-BRICK_SIZE*4)-y*BRICK_SIZE, BRICK_SIZE, -BRICK_SIZE);
				ctx.fill(); 
				ctx.stroke();
			}
			if(i%4==3) // Increment the column
				y++;
			bitMask = bitMask>>1;
		}
		
		// Draw next block border
		ctx.beginPath();
		ctx.strokeStyle = '#000000';
		ctx.rect(PLAY_AREA_WIDTH+50,-(PLAY_AREA_HEIGHT-50-BRICK_SIZE*4), BRICK_SIZE*4, -BRICK_SIZE*4);
		ctx.stroke();
	}
	
	function drawBlock(block, colX, colY, blockColor){ // Displays the block on the board, also used to reset display (when board color is passed)
		var bitMask=0x8000;
		
		for(i=0;i<16;i++){
			var bitSet = bitMask & block;
			if(bitSet!=0){ // Check for the set bit in the current piece and set the respective brick
				ctx.fillStyle=blockColor;
				ctx.strokeStyle=splitLinesColor;
				ctx.lineWidth=1;
				ctx.beginPath();
				ctx.rect(colX*BRICK_SIZE, -colY*BRICK_SIZE, BRICK_SIZE, -BRICK_SIZE);
				ctx.fill(); 
				ctx.stroke();
			}
			colX++;
			if(i%4==3) {// Increment the column
				colY++;
				colX=colX-4;
			}
			bitMask = bitMask>>1;
		}
		
		// Draw the play area border, the border might be erased when the block moves
		ctx.lineWidth = 3;
		ctx.strokeStyle = '#000000';
		ctx.beginPath();
		ctx.rect(0, 0, PLAY_AREA_WIDTH, -PLAY_AREA_HEIGHT);
		ctx.stroke();
		
		return;
	}
	
	// Animated row erase effect
	function eraseAnimation(rowNum){
		for(j=1;j<15;j++){
			ctx.fillStyle=boardColor;
			ctx.strokeStyle=splitLinesColor;
			ctx.lineWidth=1;
			ctx.beginPath();
			ctx.rect((j-1)*BRICK_SIZE, -(rowNum-1)*BRICK_SIZE, BRICK_SIZE, -BRICK_SIZE);
			ctx.fill(); 
			ctx.stroke();
		}
	}
	
	function startNewGame(){ // Start a new Game
		menuScreen = false;
		gamePaused=false;
		initModel();
		paint();
		
		// Start the game
		// Initialize current and next piece
		curPieceIndex=Math.floor(Math.random()*11)%pieces.length;
		nextPieceIndex=Math.floor(Math.random()*11)%pieces.length;
		currentPiece=pieces[curPieceIndex][rotationIndex];
		nextPiece=pieces[nextPieceIndex][rotationIndex];
				
		blockCurX = 5;
		blockCurY = 21;
		
		updateConsole(blocksColor);
		timer = setInterval(playGame, levelSpeed);
	}
	
	function pauseGame(){
		if(gamePaused || menuScreen || controlsScreen)
			return;
		selectedMenu=0;
		gamePaused = true;
		clearInterval(timer);
		showMenu(selectedMenu, pauseMenu);
	}
	
	function resumeGame(){
		menuScreen = false;
		gamePaused = false;
		paint();
		updateConsole(blocksColor);
		timer = setInterval(playGame, levelSpeed);
	}
	
	function playGame(){

		// Erase the previous block
		if(!menuScreen && !controlsScreen)
			drawBlock(currentPiece, blockCurX, blockCurY, boardColor);
		if(canMoveDown()){
			blockCurY = blockCurY-1;
		}
		else{ // Reached bottom
			reachedBottom();
		}

		// Draw the block at current x and y
		if(!menuScreen && !controlsScreen)
			drawBlock(currentPiece, blockCurX, blockCurY, blocksColor);
		
	}
	
	function canMoveDown(){
	
		// Check if the next row below is filled (any bits set, for both bottom and blocks check)
		var maskPosition = blockCurX+1; // Choose the mask based on the current block position

		for(i=0;i<4;i++){
			if(blockCurY<0 && i==0) { // The block might have moved below the bottom, Ex for square block base is empty
				i = (blockCurY*-1);
			}
			if( (board[blockCurY+i]&(0XF000>>maskPosition))<<maskPosition & ((currentPiece&(0xF000>>(4*i)))<<(4*i))){
				return false;
			}
		}
		return true;
	}
	
	function canMoveRight(){
		// Getting the columns, rotate once and bottom will hold the columns of the current
		var tmpRotationIndex=(rotationIndex+1)%pieces[curPieceIndex].length;			
		var rotatedPiece=pieces[curPieceIndex][tmpRotationIndex];
		
		// Take the first col from last and check if it can move right
		var col = new Array(4);
		col[0] = (rotatedPiece&0xF000)>>12; // Fourth Column of the block
		col[1] = (rotatedPiece&0x0F00)>>8; // Third
		col[2] = (rotatedPiece&0x00F0)>>4 // Second
		col[3] = rotatedPiece&0x000F; // First
		
		// Populate the mask
		var mask = 0x8000>>(blockCurX+5);
		
		// Get the comparison columns from the boards current values
		var boardRight = new Array(4);
		for(i=0;i<4;i++){ // For each column to be compared
			boardRight[i] = 0;
			for(j=1;j<=4;j++){ // For each brick in the col
				boardRight[i] = boardRight[i]<<1;
				if( board[blockCurY+j]&mask)
					boardRight[i] = boardRight[i]|0x1;
			}
			
			if(boardRight[i]&col[i]) // Check if any of the column in the block cant move right
				return false;
				
			mask = 0x8000>>(blockCurX+5-i-1);
				
		}
		
		return true;
	}
	
	function canMoveLeft(){
		// Getting the columns, rotate once and bottom will hold the columns of the current
		var tmpRotationIndex=(rotationIndex+1)%pieces[curPieceIndex].length;			
		var rotatedPiece=pieces[curPieceIndex][tmpRotationIndex];
		
		// Take the first col from last and check if it can move right
		var col = new Array(4);
		col[0] = (rotatedPiece&0xF000)>>12; // Fourth Column of the block
		col[1] = (rotatedPiece&0x0F00)>>8; // Third
		col[2] = (rotatedPiece&0x00F0)>>4 // Second
		col[3] = rotatedPiece&0x000F; // First
		
		// Populate the mask
		var mask = 0x8000>>(blockCurX);
		
		// Get the comparison columns from the boards current values
		var boardLeft = new Array(4);
		var colIndex = 3;
		for(i=0;i<4;i++){ // For each column to be compared
			boardLeft[i] = 0;
			for(j=1;j<=4;j++){ // For each brick in the col
				boardLeft[i] = boardLeft[i]<<1;
				if( board[blockCurY+j]&mask)
					boardLeft[i] = boardLeft[i]|0x1;
			}
			
			if(boardLeft[i]&col[colIndex--]) // Check if any of the column in the block cant move left
				return false;
				
			mask = 0x8000>>(blockCurX+i+1);
		}
		
		return true;
	}

	function canRotate(){
		// Getting the columns, of rotated blocl rotate twice and bottom will hold the columns of the current
		var tmpRotationIndex=(rotationIndex+1)%pieces[curPieceIndex].length;
		tmpRotationIndex=(tmpRotationIndex+1)%pieces[curPieceIndex].length; 
		var rotatedPiece=pieces[curPieceIndex][tmpRotationIndex];
		
		// Take the first col from last and check if it can move right
		var col = new Array(4);
		col[0] = (rotatedPiece&0xF000)>>12; // Fourth Column of the block
		col[1] = (rotatedPiece&0x0F00)>>8; // Third
		col[2] = (rotatedPiece&0x00F0)>>4 // Second
		col[3] = rotatedPiece&0x000F; // First
		
		// Populate the mask
		var mask = 0x8000>>(blockCurX+1);
		
		// Get the comparision columns from the boards current values
		var boardLeft = new Array(4);
		var colIndex = 3;
		for(i=0;i<4;i++){ // For each column to be compared
			boardLeft[i] = 0;
			for(j=1;j<=4;j++){ // For each brick in the col
				boardLeft[i] = boardLeft[i]<<1;
				if( board[blockCurY+j]&mask)
					boardLeft[i] = boardLeft[i]|0x1;
			}
			
			if(boardLeft[i]&col[colIndex--]) // Check if any of the column in the block cant move left
				return false;
				
			mask = 0x8000>>(blockCurX+i+2);
				
		}
		
		return true;
	}
	
	function reachedBottom(){ // The block has reached the least bottom possible, erase line, increment score/level
		
		if(blockCurY>20){
			clearInterval(timer);
			gameOver();
			return;
		}
		
		var maskPosition = blockCurX+1; // Choose the mask based on the current block position
		
		// Merge the block to the board
		if( blockCurY > -1){ // Block start is not in the base, Ex square will have base as blank
			board[blockCurY+1] = board[blockCurY+1] | (currentPiece&0xF000)>>maskPosition;	
		}
		if(blockCurY > -2){
			board[blockCurY+2] = board[blockCurY+2] | ((currentPiece&0x0F00)<<4)>>maskPosition;
		}
		
		board[blockCurY+3] = board[blockCurY+3] | ((currentPiece&0x00F0)<<8)>>maskPosition;
		board[blockCurY+4] = board[blockCurY+4] | ((currentPiece&0x000F)<<12)>>maskPosition;
		
		updateConsole(boardColor); // Erase board with current values
		
		var bonusEligible = false;
		
		for(i=1;i<=4;i++){
			
			if(blockCurY < 0 && i==1){ // Current block pos may be below the board, do not delete the hidden base
				i =  (blockCurY*-1) + 1;
			}
			
			if(board[blockCurY+i]==0xFFFF) {
				linesCleared++;
				// Increase the score
				if(bonusEligible==true)
					score = score + BONUS_INCREMENT;
				else
					score = score + SCORE_INCREMENT;
				bonusEligible = true;
			
				// Erase the line
				for(j=blockCurY+i;j<board.length-1;j++){
					// Move all rows above the erased one to one down
					board[j]=board[j+1];
				}
				board[board.length-1]= 0x8001;
				i--;
			}
		}

		// Check for level change
		if(bonusEligible){ // bonusEligible set=score has changed
			for(i=levelScores.length-1;i>=0;i--){
				if(score>=levelScores[i] && level!=i+1){
					level=i+1;
					levelSpeed=levelSpeed-75;
					clearInterval(timer);
					timer = setInterval(playGame, levelSpeed);
					break;
				}
			}
		}
		
		curPieceIndex=nextPieceIndex;
		currentPiece=nextPiece;
		rotationIndex=0;
		
		nextPieceIndex=Math.floor(Math.random()*11)%pieces.length;
		nextPiece=pieces[nextPieceIndex][rotationIndex];
		
		blockCurX = 5;
		blockCurY = 21;
		
		updateConsole(blocksColor); // Update with new values
	}
	
	function upAction(){ // Up Key/Swipe Up action
		if(menuScreen){ // Menu screen, start/paused
			selectedMenu = (selectedMenu+1)%2;
			showMenu(selectedMenu, currentMenu);
		}
		else{
			if(canRotate()){
				rotationIndex=(rotationIndex+1)%pieces[curPieceIndex].length;			
				currentPiece=pieces[curPieceIndex][rotationIndex];
			}
		}
	}
	
	function downAction(){ //Up Key/Swipe Up action
					if(menuScreen){ // Menu screen, start/paused
					selectedMenu = (selectedMenu+1)%2;
					showMenu(selectedMenu, currentMenu);
				}
				else{
					if(canMoveDown()){
						blockCurY = blockCurY-1;
					}
					else{ // Reached bottom
						reachedBottom();
					}
				}
	}
	
	function leftAction(){ // Left Key/Swipe Left action
		if(!menuScreen){
					if(canMoveLeft()){
						blockCurX = blockCurX-1;
					}
		}
	}
	
	function rightAction(){ // Right Key/Swipe Right action
		if(!menuScreen){
			if(canMoveRight()){
				blockCurX = blockCurX+1;
			}
		}
	}
	
	function doKeyDown(evt){ // Monitor the Key Press Event
	
		// Erase the existing block position/rotation
		if(!menuScreen && !controlsScreen)
			drawBlock(currentPiece, blockCurX, blockCurY, boardColor);
			
		if(controlsScreen) // Back to menu on any key press from controls page
			showMenu(selectedMenu, currentMenu);
			
		switch (evt.keyCode) {
			case 13: // Enter Key
				if(menuScreen && gamePaused){ // 0 - resume game, 1 - start new game
					if(selectedMenu==0)
						resumeGame();
					else
						startNewGame();
				}
				else if(menuScreen){ // Game start screen, 0 - start new game, 1 - controls
					if(selectedMenu==0)
						startNewGame();
					else
						showControls();
				}
				break;
			case 27: // ESC Key pressed, pause game
				pauseGame();
				break;
			case 38:  // Up key pressed
				upAction();
				break;
			case 40:  // Down key pressed
				downAction();
				break;
			case 37:  // Left key pressed
				leftAction();
				break;
			case 39:  // Right key pressed
				rightAction();
				break;
		}
		
		// Draw the block at the new position/rotation
		if(!menuScreen && !controlsScreen)
		drawBlock(currentPiece, blockCurX, blockCurY, blocksColor);
				
	}
	
	// Resize the game canvas when the window is resized
	function onResize() { 
		var gameWidth = window.innerWidth; 
		var gameHeight = window.innerHeight; 
		var scaleToFitX = gameWidth / 550; 
		var scaleToFitY = gameHeight / 625; 
		 
		var currentScreenRatio = gameWidth / gameHeight; 
		var optimalRatio = Math.min(scaleToFitX, scaleToFitY); 
		optimalRatio = optimalRatio-0.05;
		 
		if (currentScreenRatio >= 1.77 && currentScreenRatio <= 1.79) { 
			canvas.style.width = gameWidth + "px"; 
			canvas.style.height = gameHeight + "px"; 
		} 
		else { 
			canvas.style.width = 550 * optimalRatio + "px"; 
			canvas.style.height = 625 * optimalRatio + "px"; 
		}
	}
	
