const press = document.querySelector('.menu .nav-bar .nav-list .press'); //tells js where to get 
const mobileMenu = document.querySelector('.menu .nav-bar .nav-list ul');
const menuContent = document.querySelectorAll('.menu .nav-bar .nav-list ul li a'); //here multiple things so use All

press.addEventListener('click', () => {//when item is clicked
    mobileMenu.classList.toggle('active');//adds class active
});

menuContent.forEach((item)=> {//because multiple line use forEach
    item.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });
});