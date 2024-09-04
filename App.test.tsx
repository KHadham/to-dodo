import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import App from "./App";
import AsyncStorage from "@react-native-async-storage/async-storage";


// Mocking the AsyncStorage.getItem function
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("TodoList", () => {
  it("renders UI", () => {
    const { getByText, getByPlaceholderText } = render(<App />);

    expect(getByText("Todo List")).toBeTruthy();
    expect(getByPlaceholderText("Add a new task")).toBeTruthy();
    expect(
      getByText("No tasks yet. Add some using the button below!")
    ).toBeTruthy();
  });

  it("adds a new task", async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<App />);

    fireEvent.changeText(
      getByPlaceholderText("Add a new task"),
      "Buy groceries"
    );
    fireEvent.press(getByText("+"));

    await waitFor(() => {
      expect(
        queryByText("No tasks yet. Add some using the button below!")
      ).toBeNull();
      expect(getByText("Buy groceries")).toBeTruthy();
    });
  });

  it("marks a task as done", async () => {
    const { getByPlaceholderText, getByText, getByLabelText } = render(
      <App />
    );

    fireEvent.changeText(
      getByPlaceholderText("Add a new task"),
      "Buy groceries"
    );
    fireEvent.press(getByText("+"));

    await waitFor(() => {
      const checkBox = getByLabelText("checkbox-blank-circle-outline");
      fireEvent.press(checkBox);
      expect(getByLabelText("check-circle")).toBeTruthy();
    });
  });

  it("deletes a task", async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <App />
    );

    fireEvent.changeText(
      getByPlaceholderText("Add a new task"),
      "Buy groceries"
    );
    fireEvent.press(getByText("+"));

    await waitFor(() => {
      fireEvent.press(getByText("Buy groceries"));
      fireEvent.press(getByText("trash-can-outline"));
      expect(queryByText("Buy groceries")).toBeNull();
    });
  });

  it("saves tasks to AsyncStorage", async () => {
    const { getByPlaceholderText, getByText } = render(<App />);

    fireEvent.changeText(
      getByPlaceholderText("Add a new task"),
      "Buy groceries"
    );
    fireEvent.press(getByText("+"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "taskList",
        JSON.stringify([{ id: 0, text: "Buy groceries", done: false }])
      );
    });
  });

  it("loads tasks from AsyncStorage", async () => {
    (AsyncStorage.getItem as jest.Mock).mockReturnValueOnce(
      Promise.resolve(
        JSON.stringify([{ id: 0, text: "Buy groceries", done: false }])
      )
    );

    const { getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText("Buy groceries")).toBeTruthy();
    });
  });

  
});
