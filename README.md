# Idoti

Waste management and customer-record software for waste companies.

Idoti helps waste managers move from notebooks and spreadsheets to a central, digital system:

- Register customers by location (name, phone, optional email)
- Import existing manual records from CSV
- Track monthly collections, bills and outstanding balances
- Notify customers of what they owe (email / phone)
- Central manager dashboard; field workers can register customers on the move
- Customers never pay to view their records or bills
- Planned: public APIs so companies can connect Idoti to their own websites

> Idoti is separate from [Dustpan](https://dustpan-mvp.vercel.app) (waste marketplace). Dustpan connects sellers and buyers; Idoti manages the businesses and customers behind collection.

## AI bank statement scan (paid feature)

Paid users upload a monthly bank statement (PDF, image or CSV). `api/scan-statement.js` sends it to Claude, which returns incoming credits as JSON (date, payer, amount, reference). The page matches payers to customers and lets the manager review, then apply payments to balances.

Setup (Vercel): add env vars from `.env.example` (`ANTHROPIC_API_KEY`, `PAID_ACCESS_CODE`). The API key stays on the server and is never sent to the browser.

Known limits: the access code is a placeholder gate. Replace it with real authentication and billing before launch. Statements contain sensitive financial data, so add consent, retention rules and logging policy before real customers use it.

## Status

Early prototype: static front end with sample data, client-side validation and CSV import preview. No backend yet.

## Run locally

Open `index.html` in a browser, or run `npx serve .`

## Roadmap

1. Auth and roles (manager, field worker)
2. Database + API (customers, locations, collections, bills, payments)
3. Notifications (email, SMS)
4. Public API for company websites
5. Deploy on Vercel
