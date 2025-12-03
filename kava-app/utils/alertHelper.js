import { Alert, Platform } from 'react-native';

/**
 * Web-kompatibilna funkcija za prikaz potrditvenega dialoga
 * Na webu uporabi window.confirm, na mobilnih platformah Alert.alert
 */
export const confirmAction = (title, message, onConfirm, onCancel, confirmText = 'Izbriši', cancelText = 'Prekliči') => {
  if (Platform.OS === 'web') {
    // Na webu uporabi native confirm dialog
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed && onConfirm) {
      onConfirm();
    } else if (!confirmed && onCancel) {
      onCancel();
    }
  } else {
    // Na mobilnih platformah uporabi Alert.alert
    Alert.alert(
      title,
      message,
      [
        { text: cancelText, style: 'cancel', onPress: onCancel },
        {
          text: confirmText,
          style: 'destructive',
          onPress: onConfirm,
        },
      ]
    );
  }
};

/**
 * Web-kompatibilna funkcija za prikaz informacijskega dialoga
 */
export const showAlert = (title, message, onOk) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    if (onOk) onOk();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
};

