import asyncio
import json
import os
import websockets

SYMBOL = 'btcusdt'
BINANCE_WS_URL = f"wss://stream.binance.com:9443/ws/{SYMBOL}@trade"
CSV_FILE_PATH = 'training_data.csv'

# Initialize CSV file with headers if it does not exist
if not os.path.exists(CSV_FILE_PATH):
    with open(CSV_FILE_PATH, 'w') as f:
        f.write('price,quantity,timestamp,isBuyerMaker\n')
    print(f"[Setup] Created new training dataset at: {CSV_FILE_PATH}")

async def start_live_logger():
    while True:
        try:
            print(f"[Binance Logger] Connecting to live stream for {SYMBOL.upper()}...")
            async with websockets.connect(BINANCE_WS_URL) as websocket:
                print(f"[Binance Logger] Connected successfully! Collecting data...")
                
                async for message in websocket:
                    try:
                        parsed_payload = json.loads(message)
                        
                        # Extract core fields matching your ML tensor features
                        price = float(parsed_payload['p'])
                        quantity = float(parsed_payload['q'])
                        timestamp = parsed_payload['T']
                        is_buyer_maker = 1 if parsed_payload['m'] else 0
                        
                        # Format as a CSV row
                        csv_row = f"{price},{quantity},{timestamp},{is_buyer_maker}\n"
                        
                        # Append synchronously (or use aiofiles for heavy async writes)
                        with open(CSV_FILE_PATH, 'a') as f:
                            f.write(csv_row)
                            
                        print(f"[Logged Tick] Price: {price} | Qty: {quantity}")
                        
                    except json.JSONDecodeError:
                        print("Error parsing incoming JSON frame")
                    except KeyError as e:
                        print(f"Missing expected key in payload: {e}")
                        
        except (websockets.ConnectionClosedError, websockets.ConnectionClosedOK):
            print("WebSocket connection closed. Reconnecting in 5 seconds...")
            await asyncio.sleep(5)
        except Exception as e:
            print(f"Unexpected error: {e}. Reconnecting in 5 seconds...")
            await asyncio.sleep(5)

if __name__ == "__main__":
    try:
        asyncio.run(start_live_logger())
    except KeyboardInterrupt:
        print("\n[Logger] Stopped by user. Data collection saved to training_data.csv.")