<div align="center">

# 🏥 Mini-Hackathon-AI-36

**Digital Pharmacy for Intelligent Sri Lankans**

*An innovative AI-powered digital pharmacy solution designed to modernize and simplify healthcare access across Sri Lanka.*

</div>



## 🧐 The Selected Problem

* People in Sri Lanka can face unnecessary delays when trying to obtain medicines because they may have limited visibility into medicine availability, stock status, and prescription requirements at pharmacies. At the same time, pharmacy staff must manage inventory, low-stock and expiry risks, prescriptions, and customer orders, often through separate or manual processes. This creates a shared problem for both the community and pharmacies: customers spend time searching for medicines, while pharmacies face difficulties maintaining accurate stock information and efficiently processing orders.
* A centralized digital platform is therefore needed to make medicine availability and ordering more accessible to customers while helping pharmacies manage their daily operations more efficiently.


## 💡 The Proposed Solution

* Our platform bridges the gap between patients and pharmacies through a centralized, web-based pharmacy management and medicine ordering platform that connects customers, pharmacy staff, and administrators through a single system.
* Customers can search and view available medicines and pharmacy products, check prices and availability, place orders, and upload prescriptions when a prescription is required. Pharmacy staff can manage medicines and related products, monitor stock levels, receive low-stock and expiry alerts, review prescriptions, and process customer orders. Administrators can manage pharmacy staff, customers, and monitor current and previous orders.
* By bringing these activities into one platform, the system aims to improve medicine availability visibility for the community, reduce manual pharmacy workload, support better inventory control, and make the process of obtaining medicines more convenient and organized.

## ✨ Main Features
- **Medicine & Product Management:** Pharmacy staff can manage medicines and other pharmacy-related products through a centralized inventory system. They can add, view, update, search, and deactivate products while maintaining important information such as prices, stock quantities, minimum stock levels, expiry dates, and prescription requirements.
- **Staff Management:** Administrators can manage pharmacy staff within the system by adding new staff members, viewing and updating their details and roles, and activating or deactivating staff accounts based on their responsibilities.
- **Customer Order Management:** Customers can browse available products, add items to their cart, and place orders through the system. Pharmacy staff can view and process orders, update their status throughout the fulfillment process, cancel or reject orders when necessary, and ensure that inventory is updated when orders are processed.
- **Customer Management:** The system manages customer accounts and information to support the ordering process. Customers can register, view, and update their personal details, while authorized administrators can activate or deactivate customer accounts when necessary.
- **Inventory Alerts:** The system monitors medicine stock levels and automatically identifies products that reach or fall below their minimum stock level. It also highlights expired and soon-to-expire medicines, allowing pharmacy staff to take appropriate action.
- **Prescription Management:** Pharmacy staff can mark specific medicines as prescription-required. When customers order these products, they must upload a valid prescription, which can then be reviewed by authorized pharmacy staff before the order is approved and processed.

## 🛠️ Technologies Used
| Category | Technology |
| :--- | :--- |
| **Frontend** | React|
| **Backend** | ASP.NET Core Web API |
| **Database** |PostgreSQL |
| **Cloud/Hosting** |Vercel / Railway |

## 🤖 AI Tools Used
* **Gemini** — generated the professional Markdown structure and formatting for this README.md file; we manually populated it with our specific project details and links.
* **Claude** - used to generate the initial ASP.NET Core backend structure, including JWT authentication, controllers, EF Core models, migrations, and configuration. Our team customized the generated code, configured the database, fixed issues, added required validation and logic, and tested the APIs.
* **Claude** - used to generate the initial React frontend, including role-based dashboards, routing, protected routes, and reusable components. Our team customized the UI, connected the frontend to the backend, adjusted role permissions, fixed integration issues, and tested the user flows.
* **Claude** -used to assist with reviewing the authentication flow and core API endpoints. Our team tested registration, login, JWT authentication, and category CRUD operations, then modified and retested the implementation where necessary.
* **ChatGPT** - used for project ideation and refining the MVP scope for the selected problem.
* **NotebookLM** - used to help structure and organize the submission report and documentation.

## 👥 Team Member Details and Contributions
| Name | Role | Core Contributions |
| :--- | :--- | :--- |
| **IT24102572  Danansuriya A.T.A.D** |Problem & solution design| Framed the problem, defined the MVP scope, and the core user flow. | 
| **IT24102726  Nirwan K.G.D** |UI development| developed the frontend, and ensured responsive design. |
| **IT24102913	Gamage D.V.N** | Functional implementation | Built the features, data handling, and validation logic.|
| **IT24102664	Xavier M.A.J.K** | Testing, Git & deployment | Test and fix, manage the repository, deploy, and lead the demonstration. |

## 🔗 Project Deliverables
*   **Live Deployed Application:** [👉 Click Here to View Live App](INSERT_YOUR_DEPLOYED_URL_HERE)
*   **2-Minute Demonstration Video:** [🎬 Watch the Demo Video](INSERT_YOUR_DRIVE_OR_ONEDRIVE_LINK_HERE)

##  Installation and Execution Instructions

Follow these steps to set up the project locally on your machine.

### Prerequisites
* Ensure you have [Node.js](https://nodejs.org/) installed.
* Ensure you have [Python 3.x](https://www.python.org/) installed.

### Step 1: Clone the Repository
bash
git clone https://github.com/IT24102913/SEF_HACK_FINALTEST.git
cd SEF_HACK_FINALTEST


---

### Step 2: Backend Setup (.NET 8 Web API)

1. Navigate to the backend directory:
   bash
   cd backend
   

2. Configure Database Connection String in appsettings.json (or set environment variable):
   json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=mediapp;Username=postgres;Password=YOUR_PASSWORD"
   }
   

3. Restore dependencies and build the solution:
   bash
   dotnet restore
   dotnet build
   

4. Run the API (Database migrations and seed data will apply automatically on startup):
   bash
   dotnet run
   
   The server will start at http://localhost:5126 (or http://localhost:5000). Access Swagger UI at http://localhost:5126/swagger.

---

### Step 3: Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the web directory:
   bash
   cd web
   

2. Install dependencies:
   bash
   npm install
   

3. Ensure .env file exists with your backend API URL:
   env
   VITE_API_BASE_URL=http://localhost:5126/api
   

4. Start the development server:
   bash
   npm run dev
   
   The web application will open at http://localhost:5173.

---

   
