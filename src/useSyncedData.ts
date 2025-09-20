import { useEffect, useState, useCallback } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// Genera un ID fijo compartido para todos los dispositivos
function getSharedUserId(): string {
  // Usar un ID fijo para que todos los dispositivos compartan los mismos datos
  // Puedes cambiar este ID si quieres crear "grupos" diferentes de usuarios
  return 'shared_user_mission_diversion_2025';
}

// Hook para datos sincronizados
export function useSyncedData<T>(
  key: string,
  defaultValue: T,
  enabled: boolean = true
): [T, (newValue: T) => void, boolean] {
  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // Función para actualizar datos con useCallback para evitar recreaciones
  const updateData = useCallback(async (newValue: T) => {
    setData(newValue);
    
    // Guardar en localStorage como respaldo
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.warn('Error saving to localStorage:', error);
    }

    // Guardar en Firebase si está habilitado
    if (enabled) {
      try {
        const userId = getSharedUserId();
        const docRef = doc(db, 'userData', userId);
        await setDoc(docRef, { [key]: newValue }, { merge: true });
        // Log silencioso - solo en caso de debug
        // console.log('✅ Guardado en Firebase:', key);
      } catch (error) {
        console.warn('❌ Error saving to Firebase:', error);
      }
    }
  }, [key, enabled]);

  // Configurar Firebase una sola vez
  useEffect(() => {
    if (!enabled) {
      // Si la sincronización está deshabilitada, usar solo localStorage
      try {
        const localData = localStorage.getItem(key);
        if (localData) {
          setData(JSON.parse(localData));
        }
      } catch (error) {
        console.warn('Error reading from localStorage:', error);
      }
      setIsLoading(false);
      return;
    }

    const userId = getSharedUserId();
    const docRef = doc(db, 'userData', userId);

    // Cargar datos iniciales desde localStorage
    try {
      const localData = localStorage.getItem(key);
      if (localData) {
        setData(JSON.parse(localData));
      }
    } catch (error) {
      console.warn('Error reading from localStorage:', error);
    }

    // Configurar listener de Firebase
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const firebaseData = docSnapshot.data();
        if (firebaseData && firebaseData[key] !== undefined) {
          setData(prevData => {
            // Solo actualizar si realmente cambió
            const newValue = firebaseData[key];
            const prevString = JSON.stringify(prevData);
            const newString = JSON.stringify(newValue);
            
            if (prevString !== newString) {
              try {
                localStorage.setItem(key, newString);
              } catch (error) {
                console.warn('Error updating localStorage:', error);
              }
              return newValue;
            }
            return prevData;
          });
        }
      }
    }, (error) => {
      console.warn('❌ Firebase error:', error);
    });

    setIsLoading(false);

    return () => {
      unsubscribe();
    };
  }, [key, enabled]); // Solo key y enabled como dependencias

  return [data, updateData, isLoading];
}