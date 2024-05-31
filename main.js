function getId(id) {
  return document.getElementById(id)
}
const canvas = getId('canvas')
const ctx = canvas.getContext('2d')
const canvas_w = canvas.width = window.innerWidth
const canvas_h = canvas.height = 512
let fps = 90
let runDirection;
let speed = 3
let enemyFps = 120
let enemyShootDelay = 1000
const controller = document.querySelectorAll('div')
let idleState
let initial_direction = 'right'

const attackButton = document.getElementById('attack')



let platformFrame = {
  image: '/src/platform/grass/TX Tileset Ground.png',
  width: 256 / 8,
  height: 256 / 8
  
}
let platformPos = {x: 0, y: canvas_h - platformFrame.height }

let platforms = {
  length: 20,
  index_x: 1 * platformFrame.width,
  index_y: 0
}


let playerFrame = {
  width: canvas_h / 16,
  height: canvas_w / 16
}
let p = {
  index_x: 10, 
  index_y: 0, 
  scale: 1, 
  x: 0, 
  y: canvas_h - (playerFrame.height + platformFrame.height),
  image: new Image(),
  healthBar: {
    x: 0, y: 0,
    color: 'red',
    size: {
      width: 200,
      height: 20
    }
  }
}

const playerImage = p.image
  playerImage.src = '/src/run_right/Run (32x32).png'


const frame = {
    width: 64,
    height: 64
  }
  const pixelCount = {
    x: canvas_w/frame.width,
    y: canvas_h/frame.height
  }
let projectile = {
  index_x: 0,
  index_y: 0,
  image: new Image(),
  x: p.x,
  y: p.y 
}

let projectileFrame = {
  width: (projectile.image.width / 8) / 4,
  height: projectile.image.height / 25
}

const enemySource = {
  img: '/src/enemy/walk/FLYING.png',
  width: 324,
  height: 71
}
const enemyFrame = { 
  width: enemySource.width / 4,
  height: enemySource.height
}
const enemyVector = {
  x: canvas_w - enemyFrame.width,
  y: canvas_h - (enemyFrame.height + platformFrame.height),
  index_x: 0,
  index_y: 0,
  
}
let enemyHealth = {
    x: 0 ,
    y: 0,
    color: 'red',
    size: {
      width: enemyFrame.width,
      height: enemyFrame.height / 10
    }
  
}
let gravity = 3
let velocity = -8

let x = velocity += gravity
let bullet = {
  x: x,
  y: 0
}

const flamesArray = []


class Health {
  constructor(health, size) {
    this.health = health
    this.size = size
  }
  draw() {
    
  }
}

function backgroundSetup() {
  let img = new Image()
  img.src = 'Blue.png'
  
  for(i = 0; i < pixelCount.x; i += 1) {
    for(j = 0; j < pixelCount.y; j += 1) {
      ctx.drawImage(
      img,
      0,
      0,
      64,64,
      i * frame.width,
      j * frame.height,
      64,
      64
    )
    }
  }
  
  requestAnimationFrame(backgroundSetup)
  
}
backgroundSetup()
function drawPlayer() {
  
   
  ctx.drawImage(
    playerImage,
    p.index_x * playerFrame.width,
    p.index_y * playerFrame.height,
    playerFrame.width,
    playerFrame.height,
    p.x,
    p.y ,
    playerFrame.width * p.scale,
    playerFrame.width * p.scale
  )
  
}
let attacked
let enemySpeed = 3
let runState
class Projectile {
    constructor(x, y, radius, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = 'black'
        ctx.fill()
        ctx.closePath();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}



class Enemy {
  constructor(source, frame, enemy) {
    this.frame = frame
    this.source = source
    this.enemy = enemy
  }
  draw() {
    const image = new Image()
    image.src = this.source
    
    ctx.drawImage(
      image,
      this.enemy.index_x * this.frame.width,
      this.enemy.index_y * this.frame.height,
      this.frame.width,
      this.frame.height,
      this.enemy.x,
      this.enemy.y,
      this.frame.width,
      this.frame.height,
      
    )
  }
}



class PlatformGrass extends Enemy{
  constructor(frame, position, platform) {
    super()
    this.frame = frame
    this.position = position
    this.platform = platform
  }
  draw() {
    const image = new Image()
    image.src = this.frame.image
    for(var i = 0; i < this.platform.length; i++) {
      ctx.drawImage(
        image,
        this.platform.index_x,
        this.platform.index_y,
        this.frame.width,
        this.frame.height,
        i * this.frame.width,
        this.position.y,
        this.frame.width,
        this.frame.height,
      )
    }
  }
}
let collisionWithBullet

function enemyProjectile() {
  
  
  const a = new Projectile(enemyVector.x, enemyVector.y + ((enemyFrame.height / 2) + 11), 5, bullet)
  
  flamesArray.push(a)
}

const actions = {
  run: {
    right: function() {
      if(p.index_x <= 10) {
        p.index_x++
      }else if(p.index_x >= 10) {
        p.index_x = 0
      }
    },
    left: function() {
      if(p.index_x <= 10) {
        p.index_x++
      }else if(p.index_x >= 10) {
        p.index_x = 0
      }
    }
  },
  
  idle: {
    right: function() {
      if(p.index_x <= 9) {
        p.index_x++
      }else if(p.index_x >= 9) {
        p.index_x = 0
      }
    }
  }
}

const enemyActions = {
  flying: {
    left: function() {
      if(enemyVector.index_x <= 2) {
        enemyVector.index_x++
      }else if(enemyVector.index_x >= 2) {
        enemyVector.index_x = 0
      }
    },
    right: function() {
      
      
    },
    
  },
  idle: {
    left: function() {
      if(enemyVector.index_x <= 2) {
        enemyVector.index_x++
      }else if(enemyVector.index_x >= 2) {
        enemyVector.index_x = 0
        
      }
    }
  },
  attack:{
      left: function() {
        
        if(enemyVector.index_x <= 6) {
          enemyVector.index_x++
        } 
        else if(enemyVector.index_x >= 6) {
          if(collisionWithBullet) {
            
            p.healthBar.size.width -= 10
            collisionWithBullet = false
          }
          enemyProjectile()
          enemyVector.index_x = 0
          
        }
        
      }
    }
}

 controller.forEach((index) => {
  index.addEventListener('touchstart', (e) => {
    if (e.target.id == 'right') {
      runDirection = 'right'
      playerImage.src = '/src/run_right/Run (32x32).png'
      runState = true
      initial_direction = 'right'
    } else if (e.target.id == 'left') {
      runDirection = 'left'
      runState = true
      
      playerImage.src = '/src/run_left/Picsart_24-05-26_22-23-40-189.png'
      initial_direction = 'left'
    }
  })
  index.addEventListener('touchend', (e) => {
      runDirection = null
      idleState = true
      if(e.target.id == 'left') {
        p.index_x = 0
        runState = false 
      }else if(e.target.id = 'right') {
        p.index_x = 10
        runState = false
      }
  })
})
let bulletRadius = 5

function update() {
  
  ctx.clearRect(p.x, p.y, playerFrame.width, playerFrame.height)
  
  if(runDirection == 'right' && runState) {
    actions.run.right()
    p.x += speed
  } else if (idleState && runDirection == null) {
    p.image.src = '/src/idle/Idle (32x32).png'
    actions.idle.right()
  }else if(runState && runDirection == 'left') {
    actions.run.left()
    p.x -= speed
  } 
  
  if(p.x - playerFrame.width >= canvas_w ) {
    p.x = 0 - 2
  }
   
  
}
  
setInterval(update, fps)


let disableAttack = false
function updateEnemy() {
 
  if( (p.x + playerFrame.width) + 120 >= enemyVector.x) {
    enemySpeed = 0
   
      enemySource.img = '/src/enemy/attack/left/ATTACK.png'
      enemyActions.attack.left()
      
  }
  else{
    enemySpeed = 3
    enemySource.img = '/src/enemy/walk/FLYING.png'
    enemyActions.flying.left()
    enemyVector.x -= enemySpeed
    
  }
  
}


setInterval(updateEnemy, enemyFps)
const projectiles = []
let enemyDamaged
function updatePlayer() {
  
  requestAnimationFrame(updatePlayer)
  drawPlayer()
  
  projectiles.forEach((bullet, index) => {
  bullet.update();
  if (
    bullet.x + bullet.radius < 0 ||
    bullet.x - bullet.radius > canvas.width ||
    bullet.y + bullet.radius < 0 ||
    bullet.y - bullet.radius > canvas.height ||
    (function() {
      if(bullet.x + bullet.radius >= enemyVector.x) {
        enemyDamaged = true
        return true
      }
    })()
  ) {
    if(enemyDamaged) {
      projectiles.splice(index, 1);
      enemyDamaged = false
    }
    
    setTimeout(() => {
      projectiles.splice(index, 1);
      
    }, 0);
  }
  
});
 const playerHealth = new Health(p.healthBar, p.healthBar.size)
   
   playerHealth.draw()
}
function collision( obj) {
  return obj.x + obj.radius <= p.x + playerFrame.width || obj.y + obj.radius <= p.y - playerFrame.height
}
function RenderPlatform() {
  requestAnimationFrame(RenderPlatform)
  const plat = new PlatformGrass(platformFrame, platformPos, platforms)
  
  plat.draw()
}

function drawEnemy() {
  
  requestAnimationFrame(drawEnemy)
  flamesArray.forEach((bullet, index ) => {
    bullet.update()
    if (collision(bullet))
       {
    setTimeout(() => {
      flamesArray.splice(index, 1);
      collisionWithBullet = true
    }, 0);
  }
  })
  
  
  const image = '/src/enemy/walk/FLYING.png'
  const enemy = new Enemy(enemySource.img, enemyFrame, enemyVector)
  
  enemy.draw()
 
  const healthBar = new Health(enemyHealth, enemyHealth.size)
  healthBar.draw()
}

function shootProjectile() {
    const velocity = { x: 6, y: 0 };
    const projectile = new Projectile(p.x + 32, p.y + 16, bulletRadius, velocity);
    
    projectiles.push(projectile);
    
}

attackButton.addEventListener('click', (event) => {
   
    shootProjectile();
    
console.log('shoot')
    
});
RenderPlatform()
updatePlayer()
drawEnemy()