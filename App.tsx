import React, { useEffect, useState } from "react";
import {
  FlatList,
  LayoutAnimation,
  LayoutAnimationProperty,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
const STORAGE_KEY = "taskList";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const LayoutAnimationHandler = ({
  property = "scaleXY",
  duration = 300,
}: {
  property?: LayoutAnimationProperty;
  duration?: number;
} = {}) => {
  LayoutAnimation.configureNext({
    duration,
    create: { type: "easeIn", springDamping: 1, property },
    update: {
      type: "easeInEaseOut",
      springDamping: 1,
      property,
      duration: duration,
    },
    delete: { type: "easeOut", springDamping: 1, property },
  });
};

const TodoList = () => {
  const [taskList, setTaskList] = useState<
    { id: number; text: string; done: boolean }[]
  >([]);
  const [newTask, setNewTask] = useState("");
  const [taskIdCounter, setTaskIdCounter] = useState(0);
  const [sortMarkedFirst, setSortMarkedFirst] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks();
  }, [taskList]);

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(taskList));
    } catch (error) {
      console.error("Failed to save tasks to storage", error);
    }
  };

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        setTaskList(parsedTasks);
        setTaskIdCounter(
          parsedTasks.length ? parsedTasks[parsedTasks.length - 1].id + 1 : 0
        );
      }
    } catch (error) {
      console.error("Failed to load tasks from storage", error);
    }
  };

  const addNewTask = () => {
    LayoutAnimationHandler();
    if (newTask !== "") {
      const newTaskItem = { id: taskIdCounter, text: newTask, done: false };
      setTaskList([...taskList, newTaskItem]);
      setTaskIdCounter(taskIdCounter + 1);
      setNewTask("");
    } else {
      setError(true);
    }
  };

  const toggleTaskDone = (id: number) => {
    LayoutAnimationHandler();
    const updatedTasks = taskList.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    );
    setTaskList(sortTasks(updatedTasks, sortMarkedFirst));
  };

  const sortTasks = (
    tasks: { id: number; text: string; done: boolean }[],
    markedFirst: boolean
  ) => {
    LayoutAnimationHandler();
    return tasks.sort((a, b) => {
      if (a.done === b.done) return 0;
      return markedFirst ? (a.done ? -1 : 1) : a.done ? 1 : -1;
    });
  };

  const toggleSortOrder = () => {
    LayoutAnimationHandler();
    setSortMarkedFirst(!sortMarkedFirst);
    setTaskList(sortTasks([...taskList], !sortMarkedFirst));
  };

  const deleteTask = (id: number) => {
    LayoutAnimationHandler();
    setTaskList(taskList.filter((task) => task.id !== id));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="default" backgroundColor={"green"} />
      <View style={styles.header}>
        <Text style={styles.title}>Todo List</Text>
        <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
          <MaterialCommunityIcons
            name={sortMarkedFirst ? "sort-ascending" : "sort-descending"}
            size={30}
            color={"white"}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={taskList}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity onPress={() => toggleTaskDone(item.id)}>
              <MaterialCommunityIcons
                name={
                  item.done ? "check-circle" : "checkbox-blank-circle-outline"
                }
                size={30}
                color={item.done ? "green" : "gray"}
              />
            </TouchableOpacity>
            <TextInput
              style={item.done ? styles.textDone : styles.text}
              value={item.text}
              onChangeText={(text) =>
                setTaskList(
                  taskList.map((task) =>
                    task.id === item.id ? { ...task, text } : task
                  )
                )
              }
            />
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={30}
                color="red"
              />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>
            Belom ada tugas, silahkan tambah dulu lewat tombol tambah di bawah
          </Text>
        }
      />
      <View style={styles.inputContainer}>
        <View style={error ? styles.inputErr : styles.input}>
          <TextInput
            placeholder={
              error ? "Masukan tugas dengan benar" : "Tambah tugas baru"
            }
            placeholderTextColor={error ? "red" : "gray"}
            value={newTask}
            onChangeText={(txt) => {
              setNewTask(txt);
              setError(false);
            }}
            onSubmitEditing={addNewTask}
            style={{ flex: 1 }}
          />
          {newTask !== "" && (
            <MaterialCommunityIcons
              name="close"
              size={24}
              color="red"
              onPress={() => setNewTask("")}
            />
          )}
        </View>
        <TouchableOpacity style={styles.addButton} onPress={addNewTask}>
          <MaterialCommunityIcons name="send" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TodoList;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
    elevation: 5,
    backgroundColor: "white",
    marginBottom: 20,
  },
  sortButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
  },
  sortButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  text: {
    flex: 1,
    fontSize: 18,
    marginLeft: 10,
  },
  textDone: {
    flex: 1,
    fontSize: 18,
    marginLeft: 10,
    textDecorationLine: "line-through",
    color: "gray",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    borderTopWidth: 0.5,
    padding: 20,
    borderColor:'gray',
  },
  input: {
    flex: 1,
    padding: 10,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputErr: {
    flex: 1,
    padding: 10,
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
    backgroundColor: "white",
  },
  addButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
  emptyListText: {
    textAlign: "center",
    color: "gray",
    marginTop: 20,
    padding: 20,
    margin: 40,
    elevation: 5,
    backgroundColor: "white",
    borderRadius: 10,
  },
});
