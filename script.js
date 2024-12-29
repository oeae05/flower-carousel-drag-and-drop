/*--------------------
ITEMS
--------------------*/
const ITEMS = [
  { name: "Rose", img: "https://images.pexels.com/photos/46231/water-lilies-pink-water-lake-46231.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Tulip", img: "https://images.pexels.com/photos/1578105/pexels-photo-1578105.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Daisy", img: "https://images.pexels.com/photos/33393/caudata-strelitzia-bird-of-paradise-flower-strelitzia-orchids.jpg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Lily", img: "https://images.pexels.com/photos/207172/pexels-photo-207172.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Sunflower", img: "https://images.pexels.com/photos/1242286/pexels-photo-1242286.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Orchid", img: "https://images.pexels.com/photos/542517/pexels-photo-542517.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { name: "Lotus", img: "https://images.pexels.com/photos/1488310/pexels-photo-1488310.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { name: "Daffodil", img: "https://images.pexels.com/photos/1961778/pexels-photo-1961778.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { name: "Cherry", img: "https://images.pexels.com/photos/122737/pexels-photo-122737.jpeg?auto=compress&cs=tinysrgb&w=600" },
]

/*--------------------
VARS
--------------------*/
const dragNode = document.querySelector('.drag')
const emblaNode = document.querySelector('.embla')
const viewportNode = emblaNode.querySelector('.embla__viewport')
const containerNode = emblaNode.querySelector('.embla__container')
const prevBtnNode = emblaNode.querySelector('.embla__button--prev')
const nextBtnNode = emblaNode.querySelector('.embla__button--next')
const dotsNode = emblaNode.querySelector('.embla__dots')

let dragBoundings = dragNode.getBoundingClientRect()
const threshold = 30
let clonedElement = null
let targetElement = null

const mouse = {
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,
  isDown: false
}

/*--------------------
EMBLA OPTIONS
--------------------*/
const initializeCarousel = () => {
  const OPTIONS = {
    dragFree: true,
    loop: true
  }
  return EmblaCarousel(viewportNode, OPTIONS)
}

const emblaApi = initializeCarousel()

/*--------------------
UTILITY FUNCTIONS
--------------------*/
const getPointerCoordinates = (e) => ({
  x: e.touches ? e.touches[0].clientX : e.clientX,
  y: e.touches ? e.touches[0].clientY : e.clientY
})

const isAboveThreshold = (startY, currentY) => (currentY - startY) <= -threshold

const isInsideDropZone = (x, y) => {
  return (
    x > dragBoundings.left && 
    x < dragBoundings.left + dragBoundings.width &&
    y > dragBoundings.top &&
    y < dragBoundings.top + dragBoundings.height
  )
}

/*--------------------
HANDLE ELEMENT DRAGGING
--------------------*/
const startDragging = (e, element) => {
  mouse.startX = getPointerCoordinates(e).x
  mouse.startY = getPointerCoordinates(e).y
  mouse.isDown = true
  targetElement = element

  window.addEventListener('mousemove', handleMouseMove, true)
  window.addEventListener('touchmove', handleMouseMove, true)
  window.addEventListener('mouseup', stopDragging)
  window.addEventListener('touchend', stopDragging)
}

const handleMouseMove = (e) => {
  if (!mouse.isDown) return

  const { x, y } = getPointerCoordinates(e)

  if (isAboveThreshold(mouse.startY, y)) {
    if (!clonedElement) {
      clonedElement = createClonedElement(targetElement)
    }
  }

  if (!clonedElement) return
  
  e.stopImmediatePropagation()

  updateClonedElementPosition(x, y)
  mouse.lastX = x
  mouse.lastY = y
}

const stopDragging = () => {
  mouse.isDown = false
  targetElement = null
  if (!clonedElement) return

  if (isInsideDropZone(mouse.lastX, mouse.lastY)) {
    addClonedElementToDragZone()
  }

  removeClonedElement()
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('touchmove', handleMouseMove)
  window.removeEventListener('mouseup', stopDragging)
  window.removeEventListener('touchend', stopDragging)
}

/*--------------------
CLONED ELEMENTS
--------------------*/
const createClonedElement = (element) => {
  const cloned = element.cloneNode(true)
  cloned.classList.add('dragging')
  document.body.appendChild(cloned)
  gsap.fromTo(cloned, {
    scale: 0,
    x: '-50%',
    y: '-50%',
  }, {
    scale: 1,
    duration: .2,
    ease: 'power2.out'
  })
  return cloned
}

const updateClonedElementPosition = (x, y) => {
  gsap.set(clonedElement, {
    top: y,
    left: x,
  })
}

const addClonedElementToDragZone = () => {
  const newElement = clonedElement.cloneNode(true)
  newElement.classList.remove('dragging')
  newElement.classList.add('dragged')
  dragNode.appendChild(newElement)
  attachDeleteButton(newElement)
}

const attachDeleteButton = (element) => {
  const deleteButton = document.createElement('div')
  deleteButton.innerHTML = 'x'
  deleteButton.classList.add('delete')
  deleteButton.addEventListener('click', () => element.remove())
  element.appendChild(deleteButton)
}

const removeClonedElement = () => {
  gsap.to(clonedElement, {
    scale: 0,
    x: '-50%',
    y: '-50%',
    duration: .2,
    ease: 'power2.out',
    onComplete: () => {
      document.body.removeChild(clonedElement)
      clonedElement = null    
    }
  })
}

/*--------------------
CREATE CAROUSEL ITEMS
--------------------*/
const createCarouselItems = (items) => {
  items.forEach((item, i) => {
    const slide = document.createElement('div')
    slide.classList.add('embla__slide')

    const img = document.createElement('img')
    img.src = item.img
    slide.appendChild(img)

    const label = document.createElement('div')
    label.innerHTML = `${i} - ${item.name}`
    slide.appendChild(label)

    slide.addEventListener('mousedown', (e) => startDragging(e, slide))
    slide.addEventListener('touchstart', (e) => startDragging(e, slide))

    containerNode.appendChild(slide)
  })
}

createCarouselItems(ITEMS)

/*--------------------
HANDLE RESIZE
--------------------*/
const updateDragBoundings = () => {
  dragBoundings = dragNode.getBoundingClientRect()
}

window.addEventListener('resize', updateDragBoundings)
updateDragBoundings()
