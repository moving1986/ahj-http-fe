class TicketManager {
    constructor() {
      this.servUrl = "http://localhost:7070";
      this.ticketsBlock = document.querySelector(".tickets");
      this.addTicketBtn = document.querySelector(".add-ticket");
      this.modalAddTicket = document.querySelector(".modal-add-ticket");
      this.formAddTicket = this.modalAddTicket.querySelector(".add-form");
      this.btnAddTicket = this.formAddTicket.querySelector(".btn-add-ticket");
      
      this.initEvents();
      this.loadTickets();
    }
  
    initEvents() {
      this.addTicketBtn.addEventListener("click", () => this.showModal(this.modalAddTicket));
      
      this.formAddTicket.addEventListener("click", (e) => {
        e.preventDefault();
        if (e.target.classList.contains("modal-close")) {
          this.closeModal(e.target.closest(".modal"));
        }
      });
      
      this.btnAddTicket.addEventListener("click", (e) => this.handleFormSubmit(e));
      
      this.ticketsBlock.addEventListener("click", (e) => this.handleTicketActions(e));
    }
  
    async loadTickets() {
      const data = await this.responseXhr("GET", `${this.servUrl}?method=allTickets`);
      this.renderTickets(JSON.parse(data));
    }
  
    showModal(modal) {
      modal.classList.remove("hidden");
    }
  
    closeModal(modal) {
      modal.classList.add("hidden");
      modal.dataset.id = "";
      modal.dataset.checked = "";
      this.formAddTicket.reset();
    }
  
    async responseXhr(method, url, body = null) {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
  
        xhr.onreadystatechange = function() {
          if (this.readyState !== 4) return;
          resolve(xhr.response);
        };
  
        xhr.open(method, url);
        if (body) {
          xhr.setRequestHeader('Content-Type', 'application/json');
        }
        xhr.send(body ? JSON.stringify(body) : null);
      });
    }
  
    renderTickets(tickets) {
      this.ticketsBlock.innerHTML = "";
      tickets.forEach((ticket) => {
        const status = ticket.status ? "checked" : "";
        const newTicket = `
          <div class="ticket" data-id="${ticket.id}">
            <span class="ticket-checkbox"><input type="checkbox" ${status}></span>
            <span class="ticket-name">${ticket.name}</span>
            <span class="ticket-date">${new Date(ticket.created).toLocaleString()}</span>
            <div class="ticket-manage">
              <span class="ticket-edit"><button class="btn btn-edit"></button></span>
              <span class="ticket-remove"><button class="btn btn-remove"></button></span>
            </div>
          </div>`;
        this.ticketsBlock.insertAdjacentHTML("beforeEnd", newTicket);
      });
    }
  
    async handleFormSubmit(e) {
      e.preventDefault();
      
      const formdata = new FormData(this.formAddTicket);
      const data = Object.fromEntries(formdata.entries());
      
      if (this.modalAddTicket.dataset.id) {

        const id = this.modalAddTicket.dataset.id;
        const updateData = {
          name: data.name,
          description: data.description,
          status: this.modalAddTicket.dataset.checked === "true"
        };
        
        const response = await this.responseXhr(
          "POST", 
          `${this.servUrl}?method=updateById&id=${id}`,
          updateData
        );
      } else {
    
        const createData = {
          name: data.name,
          description: data.description
        };
        
        const response = await this.responseXhr(
          "POST", 
          `${this.servUrl}?method=createTicket`,
          createData
        );
      }
      
      await this.loadTickets(); 
      this.closeModal(e.target.closest(".modal"));
    }
  
    async handleTicketActions(e) {
      const curEl = e.target;
      const ticketEl = curEl.closest(".ticket");
      
      if (curEl.classList.contains("btn-remove")) {
        const id = ticketEl.dataset.id;
        await this.responseXhr("POST", `${this.servUrl}?method=deleteById&id=${id}`);
        await this.loadTickets();
      }
      
      if (curEl.classList.contains("btn-edit")) {
        this.showModal(this.modalAddTicket);
        this.modalAddTicket.querySelector("h3").textContent = "Редактировать тикет";
        
        const id = ticketEl.dataset.id;
        const checked = ticketEl.querySelector("input").checked;
        
        this.modalAddTicket.dataset.id = id;
        this.modalAddTicket.dataset.checked = checked;
        
        const response = await this.responseXhr("GET", `${this.servUrl}?method=ticketById&id=${id}`);
        const ticket = JSON.parse(response);
        
        this.modalAddTicket.querySelector("input").value = ticket.name;
        this.modalAddTicket.querySelector("textarea").value = ticket.description || "";
      }
      
      if (curEl.tagName === "INPUT" && curEl.type === "checkbox") {
        const id = ticketEl.dataset.id;
        const checked = curEl.checked;
        
        await this.responseXhr(
          "POST", 
          `${this.servUrl}?method=updateById&id=${id}`,
          { status: checked }
        );
      }
    }
  }
  

  document.addEventListener("DOMContentLoaded", () => {
    new TicketManager();
  });