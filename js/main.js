const cvs = document.getElementById('bird');
const ctx = cvs.getContext('2d');

//used to update bird animation
let frames = 0;

const DEGREE = Math.PI/180;

//load sprites
const sprite = new Image();
sprite.src = 'assets/images/sprite.png';

//load sounds
const sounds = {                
    score: new Audio('assets/audios/sfx_point.wav'),
    flap: new Audio('assets/audios/sfx_flap.wav'),
    hit: new Audio('assets/audios/sfx_hit.wav'),
    swooshing: new Audio('assets/audios/sfx_swooshing.wav'),
    die: new Audio('assets/audios/sfx_die.wav')
};


//game states
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2
}

//start new game button positions
const startBtn = {
    x: 120,
    y: 263,
    w: 83,
    h: 29
}

//control the game
cvs.addEventListener('click', function(evt)
{    
    switch (state.current) 
    {
        case state.getReady:
            state.current = state.game;
            sounds.swooshing.play();
            break;
        case state.game:
            bird.flap();
            sounds.flap.currentTime = 0;
            sounds.flap.play();
            break;
        case state.over:
            //get canvas size based on the viewport
            const rect = cvs.getBoundingClientRect();
            const clickX = evt.clientX - rect.left;
            const clickY = evt.clientY - rect.top;

            //check if start button was clicked on canvas
            if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.x &&
                clickY >= startBtn.y && clickY <= startBtn.y + startBtn.y) 
                {
                    pipes.reset();
                    bird.speedReset();
                    score.reset();
                    state.current = state.getReady;
                }            
            break;
        default:
            break;
    }
});  

//game background
const bg = {
    sX: 0, //x position of the source image
    sY: 0, //y position of the source image
    w: 275, //width of the image inside source image
    h: 226, //height of the image inside source image
    x: 0, //x position to be inserted on canvas
    y: cvs.clientHeight - 226, // y position to be inserted on canvas

    draw: function() 
    {        
        //we need to draw 2 backgrounds to fill the whole canvas
        ctx.drawImage(sprite, this.sX, this.sY,this.w,this.h,this.x,this.y,this.w,this.h);
        ctx.drawImage(sprite, this.sX, this.sY,this.w,this.h,this.x + this.w,this.y,this.w,this.h);        
    }
}

//foreground background (floor)
const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.clientHeight - 112,
    dx: 2, //delta x -> speed of the fg moving

    draw: function() 
    {
        ctx.drawImage(sprite, this.sX, this.sY,this.w,this.h,this.x,this.y,this.w,this.h);
        ctx.drawImage(sprite, this.sX, this.sY,this.w,this.h,this.x + this.w,this.y,this.w,this.h);        
    },

    update: function() 
    {
        if (state.current == state.game) 
        {
            //if w/2 (112), then this.x goes back to 0, making it a loop so the ground doesn't end
            this.x = (this.x - this.dx) % (this.w/2);                        
        }
    }
}

const bird = {
    //array containg all bird images flying to animate it
    animation: [
        {sX:276, sY:112 },
        {sX:276, sY: 139 },
        {sX:276 ,sY: 164 },
        {sX:276, sY: 139 },
    ],
    x: 50,
    y: 150,
    w: 34,
    h: 26,
    frame: 0, //variable used to update animations
    gravity: 0.25, //increases speed
    jump: 4.6, //size of the jump
    speed: 0, //variable to control Y values of the bird, can go up or down
    rotation: 0, //used to rotate the bird while jumping or falling
    radius: 12, //calculate collisions, since we're dealing with the center of the bird

    draw: function() 
    {
        let bird = this.animation[this.frame];

        //saves canvas state to be able to rotate the bird
        ctx.save();

        //we translate the origin of the canvas to the position of the bird, because we can only rotate the canvas        
        ctx.translate(this.x, this.y);

        //rotate in degrees
        ctx.rotate(this.rotation);

        //draws bird
        ctx.drawImage(sprite, bird.sX, bird.sY,this.w,this.h,-this.w/2,-this.h/2,this.w,this.h);

        //restore canvas state to rotate only the bird
        ctx.restore();
    },

    flap: function() 
    {           
        //we update just speed because on update we are updating birds Y position according to what we have on speed variable             
        this.speed = - this.jump;        
    },

    hitForeground: function() 
    {
        if (this.y + this.h/2 >= cvs.clientHeight - fg.h)
            return true;
    },

    update: function() 
    {            
        //speed of bird fly
        this.period = state.current == state.getReady ? 10 : 5;     
                
        //increment frame to make the animation of the bird flying trough the array of animations
        this.frame += frames % this.period == 0 ? 1 : 0;        

        //frame goes back to 0 if this.frame is bigger than array
        this.frame= this.frame % this.animation.length; 

        if (state.current == state.getReady) 
        {
            //reset variables after game over
            this.y = 150; 
            this.speed = 0; 
            this.rotation = 0 * DEGREE;
        }
        else
        {                                      
            this.speed += this.gravity;                        
            this.y += this.speed;            

            //if the speed is greater than the jump, means the bird is falling down
            if (this.speed >= this.jump) 
            {          
                if (this.hitForeground()) 
                //fall lying down
                    this.rotation = 90 * DEGREE;                                                                                                         
                else
                //fall smoothly
                    this.rotation = this.speed * this.period * DEGREE;                                                                                            
            }
            else
            {
                this.rotation = -25 * DEGREE;
            }                            
                                    
            if (this.hitForeground()) 
            {                                
                this.y = cvs.clientHeight - fg.h;
                this.frame = 0;                
                if (state.current == state.game) 
                {
                    state.current = state.over;                    
                    sounds.die.play();
                }
            }            
        }
    },

    speedReset: function() 
    {
        this.speed = 0;
    },

}

const getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: cvs.clientWidth/2 - 173/2, //center the message
    y: 80,

    draw: function() 
    {
        if (state.current == state.getReady) 
        {
            ctx.drawImage(sprite, this.sX, this.sY,this.w,this.h,this.x,this.y,this.w,this.h);
        }            
    }
}

const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: cvs.clientWidth/2 - 225/2, //center the game over message
    y: 90,

    draw: function() 
    {
        if (state.current == state.over) 
        {
            ctx.drawImage(sprite, this.sX, this.sY,this.w,this.h,this.x,this.y,this.w,this.h);
        }        
    }
}

const pipes = {
    gap: 85, //dist between pipes
    dx: 2, //speed of the pipes
    x: cvs.clientWidth,
    maxYPos: -150,//max Y position of the pipe
    position: [], //contains all pipes    
    w: 53,
    h: 400,

    bottom: {
        sX: 502,
        sY: 0
    },
    top: {
        sX: 553,
        sY: 0
    },

    draw: function() 
    {
        for (let i = 0; i < this.position.length; i++) 
        {
            let p = this.position[i];
            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            //top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY,this.w,this.h,p.x,topYPos,this.w,this.h);

            //bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.top.sY,this.w,this.h,p.x,bottomYPos,this.w,this.h);
        }
    },

    update: function() 
    {
        if (state.current !== state.game) return;

        if (frames % 100 == 0) 
        {
            this.position.push({
                x: cvs.clientWidth,
                y: this.maxYPos * (Math.random()+ 1)
            })
        }
        

        //move the pipes
        for (let i = 0; i < this.position.length; i++) 
        {
            let p = this.position[i];                        
            //collision detection
            let bottomPipeYPos = p.y + this.h + this.gap;

            if (hasCollision(p,this.w, this.h,bottomPipeYPos)) 
            {
                state.current = state.over; 
                sounds.hit.play();
                pipes.reset();                
            }                        
                 
            //move the pipes to the left
            p.x -= this.dx;                        

            //if pipe goes beyond screen remove from array's pipe
            if (p.x + this.w <= 0) 
            {                
                this.position.shift();                
                score.value++;              
                sounds.score.play();  
                score.best = Math.max(score.value,score.best);
                localStorage.setItem('best', score.best);
            }            
        }        
    },

    reset: function() {
        this.position = [];
    },
}

let score = 
{
    best: parseInt(localStorage.getItem('best')) || 0,
    value: 0,
    
    draw: function() {
        ctx.fillStyle = '#FFF';
        ctx.fillStroke = '#000';
        
        if (state.current == state.game) 
        {            
            ctx.lineWidth = 2;
            ctx.font = '35px Teko';
            ctx.fillText(this.value,ctx.clientWidth/2,50);            
            ctx.strokeText(this.value,cvs.clientWidth/2,50);
        }
        else if (state.current == state.over) 
        {
            ctx.font = '25px Teko';

            ctx.fillText(this.value,225,186);            
            ctx.strokeText(this.value,225,186);

            ctx.fillText(this.best,225,228);            
            ctx.strokeText(this.best,225,228);                        
        }
    },  

    reset: function() {
        this.value = 0;
    }

}


const medals = {
    x: 72,
    y: 175,
    w: 45,
    h: 45,

    white: {
        sX: 312,
        sY: 112,
    },

    bronze: {
        sX: 359,
        sY: 157,
    },

    silver: {
        sX: 359,
        sY: 112,
    },

    gold: {
        sX: 312,
        sY: 157,
    },    

    draw: function() 
    {
        if (state.current == state.over) 
        {
            switch (true) 
            {
                case (score.value <= 10):
                    ctx.drawImage(sprite, this.white.sX, this.white.sY, this.w, this.h, this.x, this.y, this.w, this.h);                    
                    break;
                case (score.value > 10 && score.value <= 20):
                    ctx.drawImage(sprite, this.bronze.sX, this.bronze.sY, this.w, this.h, this.x, this.y, this.w, this.h);                    
                    break;
                case (score.value > 20 && score.value <= 30):
                    ctx.drawImage(sprite, this.silver.sX, this.silver.sY, this.w, this.h, this.x, this.y, this.w, this.h);                    
                    break;
                case (score.value > 30):
                    ctx.drawImage(sprite, this.gold.sX, this.gold.sY, this.w, this.h, this.x, this.y, this.w, this.h);                    
                    break;
                default:
                    break;
            }
        }
            
    }    
}

function hasCollision(pipe, width, height, bottomPipeYPos) 
{
    //top pipe
    if (bird.x + bird.radius > pipe.x && 
        bird.x - bird.radius < pipe.x + width && 
        bird.y + bird.radius > pipe.y && 
        bird.y - bird.radius < pipe.y + height) 
        return true;

    //bottom pipe        
    if (bird.x + bird.radius > pipe.x 
        && bird.x - bird.radius < pipe.x + width && 
        bird.y + bird.radius > bottomPipeYPos && 
        bird.y - bird.radius < bottomPipeYPos + height)             
        return true;

    //sky 
    if (bird.y <= 0) 
        return true;    

    return false;
}

function draw() 
{
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0,0,cvs.clientWidth,cvs.clientHeight);
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
    medals.draw();
}

function update() {
    bird.update();
    fg.update();
    pipes.update();
}

function loop() {    
    update();
    draw();
    frames++;        
    requestAnimationFrame(loop);
}

loop();