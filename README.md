# OCTRA Auto Wallet Generator

This project is an **automated wallet generator** written in Node.js. It supports both manual and automatic wallet creation, saving each wallet to a local file.

## 🔧 Features

- Manual wallet generation on demand
- Automatic wallet generation with evenly distributed intervals over a 24-hour period
- Wallet data saved securely in individual files
- Interactive CLI menu for ease of use

## 📦 Requirements

- Node.js v14 or higher
- Internet access to connect with the wallet generation server
- A VPS or API endpoint capable of handling wallet generation requests on port `8888`

## 📥 Installation

1. **Clone the repository**

```bash
git clone https://github.com/NSNSOP/OCTRA_auto_generate.git
cd OCTRA_auto_generate
```

2. **Install dependencies**

```bash
npm install
```

If `prompts` is not found, the script will install it automatically when first run.

## ⚙️ Configuration

Before running the script, you must configure the wallet generation endpoint:

1. Open `auto_generator.js`
2. Locate the following line:

```javascript
const url = "http://IP_VPS:8888/generate";
```

3. Replace `IP_VPS` with your actual server IP address. For example:

```javascript
const url = "http://123.45.67.89:8888/generate";
```

> Ensure your VPS is running the wallet generation service on port 8888.

## 🚀 Usage

Run the script using Node.js:

```bash
node auto_generator.js
```

### From the menu, you can:

- **Generate wallets manually:** Specify how many wallets you want to generate instantly.
- **Run automatic mode:** Automatically generate a random number of wallets (between 50–100) distributed evenly over 24 hours.

## 📂 Output

Wallets are saved as `.txt` files inside the `YourOctraProject` folder. Each file contains:

- Wallet address
- Mnemonic phrase
- Private key (base64-encoded)
- Timestamp

⚠️ **Keep these files secure and do not share them.**

## 📝 Notes

- Use `CTRL + C` to stop the script during automatic generation.
- The script supports restarting and continuing as needed.
- Ensure your server is always online when using automatic mode.
