/* eslint-disable no-undef */
const url = new URLSearchParams(window.location.search);
const { username, receiver } = Object.fromEntries(url.entries());

if (!username) {
  window.alert("Sério todelover? cadê seu nome? preencha e volte!");
  window.location.href = "/index.html";
}

const mainSection = document.querySelector("#main-section");
const divMessages = document.querySelector("#messages");
const divUsers = document.querySelector("#users");

if (!receiver) {
  mainSection.innerHTML = /* html */ `
        <div class="max-w-md flex flex-col select-none pointer-events-none items-center opacity-30 justify-center mx-auto animate-pulse py-8 space-y-4 text-black">
            <img class="w-40 h-40" src="https://static.thenounproject.com/png/4147389-200.png"/>
            <h1 class="text-lg text-center uppercase font-medium">Escolha outro todelover ao lado, ${username}</h1>
        </div>
    `;
}

const btnSidebar = document.querySelector("#btn-sidebar");
const sidebar = document.querySelector("#sidebar");

btnSidebar.addEventListener("click", () => {
  btnSidebar.classList.toggle("active");
  sidebar.classList.toggle("active");
});

// create connection
const socket = io({
  extraHeaders: {
    id: username,
  },
});

if (receiver) {
  const inputMessage = document.querySelector("#inMessage");
  const btnMessage = document.querySelector("#btnMessage");

  btnMessage.addEventListener("click", () => {
    const { value } = inputMessage;
    if (value.trim() !== "") {
      const data = JSON.stringify({
        receiver,
        msg: value,
      });

      socket.emit("message", data);
      setMessageHTML(username, value);

      inputMessage.value = "";
      return;
    }

    inputMessage.focus();
  });
}

// methods (on)
socket.on("msg", (data) => {
  notifyMessage(data);
  data.forEach(({ sender, msg }) => {
    if (sender === receiver) {
      setMessageHTML(sender, msg);
    }
  });
});

socket.on("users", (data) => {
  divUsers.innerHTML = "";
  const otherUsers = data.filter((user) => user.name !== username) ?? [];
  otherUsers.forEach(({ name, online }) => setButtonLinkUser(name, online));
});

// UTILS

function notifyMessage(data = []) {
  const title = document.title;
  document.title = `(${data.length}) · Mensagens`;

  data.forEach((msg) => {
    if (msg.sender !== receiver) {
      const notification = data.length > 9 ? "+9" : data.length;
      const btnUser = document.querySelector(`[data-user="${msg.sender}"]`);
      btnUser.setAttribute("data-notify", notification);
    }
  });

  setTimeout(() => {
    document.title = title;
  }, 3000);
}

function setMessageHTML(sender, msg) {
  const element = document.createElement("div");
  const isSender = sender === username;

  element.innerHTML = /* html */ `
    <div class="
        w-full max-w-2xl 
        ${isSender ? "text-end" : "text-start"}
    ">
        <div class="py-2">
            <div class="w-full max-w-xl">
                <span class="block font-medium text-md text-gray-300">
                    ${isSender ? "Você" : sender}
                  </span>
                <p>${msg}</p>
            </div>
        </div>
    </div>
    `;

  divMessages.append(element);
  window.scrollTo(0, mainSection.scrollHeight);
}

function setButtonLinkUser(name, online) {
  const element = document.createElement("div");
  const { pathname } = window.location;
  element.innerHTML = /* html */ `
    <li>
        <a
            href="${pathname}?username=${username}&receiver=${name}"
            data-user="${name}"
            class="flex items-center gap-4 p-4 text-sm text-gray-400 rounded-lg hover:bg-zinc-800 hover:text-white">
            <svg stroke="${online ? "#4f7" : "#f47"}"
            fill="none" stroke-width="2" viewBox="0 0 24 24"
                stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <div>    
                <span>${name}</span>
            </div>
        </a>
    </li>
    `;

  divUsers.append(element);
}
