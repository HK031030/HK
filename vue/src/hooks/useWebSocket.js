// useWebSocket.js - Updated version
import { ref } from 'vue';

export function useWebSocket({ url, onMessage, onError, onClose }) {
  const isConnected = ref(false);
  let ws = null;
  
  function connect(authParams) {
    if (ws) {
      try {
        ws.close();
      } catch (e) {
        console.error('关闭先前连接时出错:', e);
      }
    }
    // 根据文档构建正确的URL
    const baseUrl = url.value;
    const wsUrl = `${baseUrl}?authorization=${encodeURIComponent(authParams.authorization)}&date=${encodeURIComponent(authParams.date)}&host=${encodeURIComponent(authParams.host)}`;
    console.log("WebSocket URL:", wsUrl);

    console.log('尝试连接 WebSocket:', wsUrl);
    
    try {
      ws = new WebSocket(wsUrl);
      
      // 添加超时处理
      const connectTimeout = setTimeout(() => {
        if (!isConnected.value && ws) {
          console.error('WebSocket 连接超时');
          ws.close();
          onError(new Error('WebSocket 连接超时'));
        }
      }, 10000);
      
      ws.onopen = () => {
        clearTimeout(connectTimeout);
        isConnected.value = true;
        console.log('WebSocket 连接成功');
      };
      
      ws.onmessage = (event) => {
        try {
          onMessage(event);
        } catch (e) {
          console.error('处理消息时出错:', e);
          onError(e);
        }
      };
      
      ws.onerror = (event) => {
        clearTimeout(connectTimeout);
        console.error('WebSocket 错误:', event);
        isConnected.value = false;
        onError(event);
      };
      
      ws.onclose = (event) => {
        clearTimeout(connectTimeout);
        console.log('WebSocket 连接已关闭', event);
        isConnected.value = false;
        onClose();
      };
    } catch (error) {
      console.error('创建 WebSocket 连接时出错:', error);
      onError(error);
    }
  }
  
  function sendMessage(data) {
    if (ws && isConnected.value) {
      try {
        ws.send(data);
      } catch (error) {
        console.error('发送消息时出错:', error);
        onError(error);
      }
    } else {
      onError(new Error('WebSocket 未连接'));
    }
  }
  
  async function reconnect(authParams) {
    if (ws) {
      try {
        ws.close();
      } catch (e) {
        console.error('关闭连接时出错:', e);
      }
    }
    
    return new Promise((resolve, reject) => {
      connect(authParams);
      
      const connectTimeout = setTimeout(() => {
        reject(new Error('重连超时'));
      }, 5000);
      
      const originalOnOpen = ws.onopen;
      ws.onopen = (event) => {
        clearTimeout(connectTimeout);
        if (originalOnOpen) originalOnOpen(event);
        resolve();
      };
      
      const originalOnError = ws.onerror;
      ws.onerror = (event) => {
        clearTimeout(connectTimeout);
        if (originalOnError) originalOnError(event);
        reject(new Error('重连失败'));
      };
    });
  }
  
  return { isConnected, connect, sendMessage, reconnect };
}