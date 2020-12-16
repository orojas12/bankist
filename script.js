"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  username: "jonas123",
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-11-30T09:15:04.904Z",
    "2020-12-06T10:17:24.185Z",
    "2020-12-08T14:11:59.604Z",
    "2020-12-11T17:01:17.194Z",
    "2020-12-12T23:36:17.929Z",
    "2020-12-13T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  username: "jess123",
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2020-11-30T09:15:04.904Z",
    "2020-12-06T10:17:24.185Z",
    "2020-12-08T14:11:59.604Z",
    "2020-12-11T17:01:17.194Z",
    "2020-12-12T23:36:17.929Z",
    "2020-12-13T10:51:36.790Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/**
 * Formats the date of a movement for the current account's locale and currency.
 * @param {Object} date The date of this movement.
 */
const formatMovementDate = function (date) {
  const calcDaysPassed = (date1, date2) => {
    return Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  };
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(currentAccount.locale).format(date);
};

/**
 * Formats a number as currency that is appropriate for the given locale.
 * @param {Number} value The value to be formatted.
 * @param {String} locale The locale the value will be formatted for.
 * @param {Number} currency The currency the value will be formatted for.
 */
const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

/**
 * Displays all transactions belonging to the current account.
 * @param {Array} movements Array of transactions belonging to current account.
 * @param {boolean} sort Indicates whether to sort movements in descending order or not.
 */
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = ""; // Removes the example elements from the movements container.

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  // Inserts each movement into the movements container (containerMovements).
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";
    const date = new Date(acc.movementsDates[i]); // Create date object from ISO format string.

    const displayDate = formatMovementDate(date);
    const amount = formatCurrency(mov, acc.locale, acc.currency);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    }. ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${amount}</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

/**
 * Display the total income, expenses, and interest of the account
 * @param {Object} acc The current account
 */
const displaySummary = function (acc) {
  const sumIn = acc.movements
    .filter((mov) => mov > 0)
    .reduce((accum, mov) => accum + mov, 0);
  labelSumIn.textContent = `${formatCurrency(sumIn, acc.locale, acc.currency)}`;

  const sumOut = acc.movements
    .filter((mov) => mov < 0)
    .reduce((accum, mov) => accum + mov, 0);
  labelSumOut.textContent = `${formatCurrency(
    sumOut,
    acc.locale,
    acc.currency
  )}`;

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((interest) => interest > 1)
    .reduce((accum, interest) => accum + interest, 0);
  labelSumInterest.textContent = `${formatCurrency(
    interest,
    acc.locale,
    acc.currency
  )}`;
};

/**
 * Displays the balance of an account with proper formatting.
 * @param {Object} acc The account for which to display the balance.
 */
const displayBalance = function (acc) {
  acc.balance = acc.movements.reduce((accum, mov) => accum + mov, 0);

  labelBalance.textContent = `${formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
};

/**
 * Updates the UI with current account information.
 * @param {Object} acc The account for which to update the UI.
 */
const updateUI = function (acc) {
  displayMovements(acc);
  displayBalance(acc);
  displaySummary(acc);
};

const startLogoutTimer = function () {
  const tick = function () {
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }
    const min = String(Math.floor(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    time--;
  };
  // set time to 5 min
  let time = 300;

  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

//////////////////////////////////////////////////////////
// EVENT HANDLERS

let currentAccount, timer;

btnLogin.addEventListener("click", function (e) {
  e.preventDefault(); // Prevent undesired page reload

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === +inputLoginPin.value) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }!`;
    containerApp.style.opacity = 100; // Un-hides UI.

    const now = new Date();
    const dateOptions = {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      dateOptions
    ).format(now);

    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    updateUI(currentAccount);

    if (timer) {
      clearInterval(timer);
    }
    timer = startLogoutTimer();
  }
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAccount = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount.username !== currentAccount.username
  ) {
    // Do the transfer
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }, 2500);
  }

  inputLoanAmount.value = "";
  inputLoanAmount.blur();
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const accIndex = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    accounts.splice(accIndex, 1);
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = "s";
  inputClosePin.blur();
});

let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

containerApp.addEventListener("mousemove", function () {
  clearInterval(timer);
  timer = startLogoutTimer();
});

//////////////////////////////////////////////////////////
