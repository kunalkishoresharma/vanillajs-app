/* Copyright
** Date : 03-12-2020
** Author: Kunal K S
*/

var productsContent = document.querySelector('#products');
var cartBox = document.querySelector('#cart-store');
var cartTotal = document.querySelector('#cart-total');
var windowWidth = window.innerWidth; 
//get item index form storage 
var getItemFromCart = JSON.parse(localStorage.getItem('productsInCart'));

//if productArr is null set to be blank array 
var productArr = getItemFromCart === null ? [] : getItemFromCart;

const product = {

    //fetch and render items
    init: function () {
        fetch('./cart.json', {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.length > 0) {
                    res.map((items, i) => {
                        var productsItems = `<div class="dGrid__Item">
                        <a href="#" class="p__link--wrapper">
                        <span class="discount__badge">${items.discount}% off</span>
                        <div class="media__wrapper">
                            <img src="${items.image}" alt="${items.name}"/>
                        </div>
                            <div class="product__title">${items.name}</div>
                            <div class="flex product__box--bottom">
                                <div class="mb-2">
                                    <span class="p__price mrp__price">₹${items.price.display}</span><span class="p__price">₹${items.price.actual}</span>
                                </div>
                                <div class="mb-2">
                                    <button class="ButtonLink  ButtonLink--Outline addtocart__btn" onclick='product.addtocart(${items.id}, 1)'>Add to cart</button>
                                </div>
                            </div>
                        </a>
                    </div>`;
                        productsContent.innerHTML += productsItems;

                    })
                }
                else {
                    productsContent.innerHTML = '<h2 class="info info-warning">Something went wrong</h2>';
                }
            })
            .then(() => {
                this.cartItems();
            })
            .catch(err => {
                productsContent.innerHTML = `<h2 class="info info-warning">Something went wrong!! ${err}!!</h2>`;
            })

    },
    //add to cart function call by button
    addtocart: function (id, qty) {
        event.preventDefault();
        var checkExisted = productArr.some(function (el) { return el.id === id });
        if (!checkExisted) {
            productArr.push({ "id": id, "qty": qty });
            localStorage.setItem('productsInCart', JSON.stringify(productArr))
            messageBox('info-success', "Product was added in the cart");
            this.cartItems(id, qty);
        } else {
            messageBox('info-warning', "Product already added");
        }
    },
    //cart box 
    cartItems: function (id, qty) {
        var getItemFromCart = JSON.parse(localStorage.getItem('productsInCart'));
        fetch('./cart.json', {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then(res => res.json())
            .then(res => {
                const result = res.filter((elem) => getItemFromCart.find(({ id }) => elem.id === id));      
                let qty = 1;
               
                if (result.length > 0) {
                  
                cartBox.innerHTML = `<div class="cart__items--wrapper">` +
                    result.map((items) => {
                        qty = getItemFromCart.filter(x => x.id === items.id).map(x => x.qty);
                        return `
                        <div class="cart__items">
                        <div class="cart__image">
                            <img src="${items.image}" class="cart-thumb" alt="${items.name}"/>
                            <span>${items.name}</span>
                        </div>
                        <div class="cart__item--delete mb-1">
                            <button class="btn--delete" title="remove item from cart" onclick="product.removeItem(${items.id})">Delete</button>
                        </div>
                        <div class="cart__qty">
                                <input type="hidden" id="display-price-${items.id}" value="${items.price.display}"/>
                                <input type="hidden" id="display-price-qty-${items.id}" value="${items.price.display * qty}"/>

                                <input type="hidden" id="base-price-${items.id}" value="${items.price.actual}"/>
                                <input type="hidden" id="total-price-${items.id}" value="${items.price.actual * qty}"/>
                                <input type="hidden" id="discount-price-${items.id}" value="${(items.price.display - items.price.actual)}"/>
                                <input type="hidden" id="discount-price-qty-${items.id}" value="${(items.price.display - items.price.actual) * qty}"/>

                                <input class="qty__btn qty__btn--minus" type="button" onclick="decrementValue(${items.id})" value="-" />
                                <input class="qty--field" type="text" name="quantity" value="${qty}" maxlength="2" max="10" size="1" id="qtycount-${items.id}" />
                                <input  class="qty__btn qty__btn--plus" type="button" onclick="incrementValue(${items.id})" value="+" />
                        </div>
                        <div class="cart__price">                       
                            ₹<span class="grand__price-${items.id}">${items.price.actual * qty}</span>
                        </div>
                    </div>`;
                    }).join('') + `</div>`;
                }
                else {
                    cartBox.innerHTML = '<div class="cart__items--wrapper"><p class="empty__text">No products in the cart.</p></div>';
                    //document.querySelector('#cart-total').remove()
                }
            })
            
            .then(() => {
                this.totalPrice();
            })
            .catch(err => {
                cartBox.innerHTML = `<div class="cart__items--wrapper"><p class="empty__text">No products in the cart.</p></div>`;
            })
    },
    //Total count
    totalPrice: function () {
        let getTotalQty = 0;
        document.querySelectorAll('[id^="qtycount-"]').forEach((q) => getTotalQty += parseInt(q.value));
        document.querySelector('#total-qty-cart').innerText = getTotalQty;
        let grandTotal = 0;
        document.querySelectorAll('[id^="display-price-qty-"]').forEach((p) => grandTotal += parseInt(p.value));
        let totalDiscount = 0;
        document.querySelectorAll('[id^="discount-price-qty-"]').forEach((d) => totalDiscount += parseInt(d.value));
        if(getTotalQty >0){
            cartTotal.innerHTML = `<div class="cart__items--wrapper">
                    <table class="table">
                    <thead>
                        <tr>
                            <th colspan="2">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="2">items <span class="badge">(${getTotalQty})</span></td>
                        
                        </tr>
                        <tr>
                            <td>Total MRP</td>
                            <td class="text-right">
                                ${grandTotal}
                            </td>
                        </tr>
                        <tr>
                            <td>Discount on MRP</td>
                            <td class="text-right">
                                - ${totalDiscount}
                            </td>
                        </tr>
                    
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>Order Total</th>
                            <th class="text-right">${grandTotal - totalDiscount}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
            `
        }else{
            cartTotal.innerHTML = '';
        }
   },
   removeItem : function(id){
    var removeByAttr = function(arr, attr, value){
        var i = arr.length;
        while(i--){
           if( arr[i] 
               && arr[i].hasOwnProperty(attr) 
               && (arguments.length > 2 && arr[i][attr] === value ) ){ 
    
               arr.splice(i,1);
    
           }
        }
        return arr;
    }
    removeByAttr(getItemFromCart, 'id', id);   
    localStorage.setItem('productsInCart', JSON.stringify(getItemFromCart))
    //update cart
    this.cartItems();
   }
}
product.init();

//alert component
function messageBox(type, value) {
    if (document.body.querySelector('.alert--box') !== null) {
        document.querySelector('.alert--box').remove()
    }
    var templete = `<div class="alert--box info ${type}">${value}</div>`
    document.body.insertAdjacentHTML('beforeend', templete);
    setTimeout(() => {
        if (document.body.querySelector('.alert--box') !== null) {
            document.querySelector('.alert--box').remove()
        }
    }, 2000)
}

//update qty to array list
function updateQty(id, propName, value) {
    var getArrayFromCart = JSON.parse(localStorage.getItem('productsInCart'));
    let item = getArrayFromCart.find((v) => {
        return v.id == id;
    });
    if (item && item.hasOwnProperty(propName)) {
        item[propName] = value;
    }
    localStorage.setItem('productsInCart', JSON.stringify(getArrayFromCart))
};

//qty increment function 
function incrementValue(id) {
    var value = parseInt(document.querySelector('#qtycount-' + id).value, 10);
    value = isNaN(value) ? 0 : value;
    if (value < 10) {
        value++;
        document.querySelector('#qtycount-' + id).value = value;

        //multiply to price
        let basePrice = document.querySelector('#base-price-' + id).value;
        document.querySelector('.grand__price-' + id).textContent = basePrice * value;
        document.querySelector('#total-price-' + id).value = basePrice * value;

        //discount update
        let discountPrice = document.querySelector('#discount-price-' + id).value;
        document.querySelector('#discount-price-qty-' + id).value = discountPrice * value;

        //display price update
        let displayPrice = document.querySelector('#display-price-' + id).value;
        document.querySelector('#display-price-qty-' + id).value = displayPrice * value;

        //set updated qty to storage
        updateQty(id, 'qty', value);
        var getArrayFromCarts = JSON.parse(localStorage.getItem('productsInCart'));

        product.totalPrice();
    }
}

//qty decrement function
function decrementValue(id) {
    var value = parseInt(document.querySelector('#qtycount-' + id).value, 10);
    value = isNaN(value) ? 0 : value;
    if (value > 1) {
        value--;
        document.querySelector('#qtycount-' + id).value = value;

        //multiply to price
        let basePrice = document.querySelector('#base-price-' + id).value;
        document.querySelector('.grand__price-' + id).textContent = basePrice * value;
        document.querySelector('#total-price-' + id).value = basePrice * value;

        //discount update
        let discountPrice = document.querySelector('#discount-price-' + id).value;
        document.querySelector('#discount-price-qty-' + id).value = discountPrice * value;

        //display price update
        let displayPrice = document.querySelector('#display-price-' + id).value;
        document.querySelector('#display-price-qty-' + id).value = displayPrice * value;

        //set updated qty to storage
        updateQty(id, 'qty', value);
        var getArrayFromCarts = JSON.parse(localStorage.getItem('productsInCart'));
        product.totalPrice();
    }

}

//toggle only 
if(windowWidth < 992){
document.querySelector('.Button__Cart').addEventListener('click', toggleCart)
function toggleCart() {
    var cartSidebar = document.querySelector('.cart__sidebar');
    if (cartSidebar.style.display === 'none') {
      cartSidebar.style.display = 'block';
    } else {
      cartSidebar.style.display = 'none';
    }
  }
}