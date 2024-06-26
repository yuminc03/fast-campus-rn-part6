import React from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Colors from 'open-color';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';

import useReminder from '../../hooks/useReminder';
import Screen from '../../components/Screen';

const RemindersScreen = () => {
  const { reminders, removeReminder } = useReminder();

  return (
    <Screen>
      <FlatList
        contentContainerStyle={styles.reminderList}
        data={reminders}
        renderItem={({ item: reminder }) => {
          return (
            <View style={styles.reminderItem}>
              <View style={styles.textContainer}>
                <Text style={styles.titleText}>
                  {reminder.notification.body}
                </Text>
                {'timestamp' in reminder.trigger && (
                  <Text style={styles.timestampText}>
                    {moment(reminder.trigger.timestamp).format('LLL')}
                  </Text>
                )}
              </View>
              <View style={styles.removeReminderContainer}>
                <TouchableOpacity
                  onPress={() => {
                    if (reminder.notification.id != null) {
                      removeReminder(reminder.notification.id);
                    }
                  }}>
                  <Icon
                    style={styles.removeReminderIcon}
                    name="notifications-off"
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  reminderList: {
    padding: 20,
  },
  textContainer: {
    flex: 1,
  },
  reminderItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    borderColor: Colors.gray[6],
    flexDirection: 'row',
  },
  titleText: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: 'bold',
  },
  bodyText: {
    marginTop: 2,
  },
  timestampText: {
    marginTop: 2,
    fontSize: 14,
    color: Colors.white,
  },
  separator: {
    height: 8,
  },
  removeReminderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeReminderIcon: {
    color: Colors.white,
    fontSize: 24,
  },
});

export default RemindersScreen;
