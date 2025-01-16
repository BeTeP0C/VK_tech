import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import {Test, userStore } from "./Test";
import "@testing-library/jest-dom";

const mockCats = [
  { name: "mojombo", url: "https://avatars.githubusercontent.com/u/1?v=4", id: "1", breeds: [{ name: 'someBreed' }] },
  { name: "defunkt", url: "https://avatars.githubusercontent.com/u/2?v=4", id: "2", breeds: [{ name: 'anotherBreed' }] },
];

describe("Test Component", () => {
  beforeEach(() => {
    userStore.cats = [];
    userStore.isLoading = 'alive';
    userStore.amountCats = 0;
  });
  test("Рендер списка пользователей при загрузке", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCats),
      })
    ) as jest.Mock;

    await act(async () => {
      render(<Test />);
      await waitFor(() => userStore.isLoading === "alive");
    });

    expect(userStore.cats).toHaveLength(2);
    expect(screen.getByText("someBreed")).toBeInTheDocument();
    expect(screen.getByText("anotherBreed")).toBeInTheDocument();
  });

  test("Отображение индикатора загрузки", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCats),
      })
    ) as jest.Mock;

    render(<Test />);

    expect(screen.getByTestId('loader')).toBeInTheDocument(); // Проверяем, что лоадер показан
    await waitFor(() => userStore.isLoading === "alive"); // Ожидаем окончания загрузки
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument(); // Проверяем, что лоадер скрыт
  });


  test("Отображение сообщения об ошибке", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("test error"))) as jest.Mock;
    render(<Test />);

    await waitFor(() => userStore.isLoading === "dead"); // Ожидаем ошибки

    expect(screen.getByText("Ошибка загрузки")).toBeInTheDocument(); // Проверяем сообщение об ошибке
    expect(userStore.cats).toHaveLength(0) // Кошки не должны загрузиться
  });

  test("Редактирование элемента в списке", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCats),
      })
    ) as jest.Mock;

      await act(async () => {
        render(<Test />);
        await waitFor(() => userStore.isLoading === "alive");
      });

    const editButton = screen.getAllByTestId("button_edit");
    fireEvent.click(editButton[0]);

    const inputField = screen.getByRole("textbox");
    fireEvent.blur(inputField, { target: { value: "mojombo_edited" } });


    const saveButton = screen.getAllByTestId('button_save');
    fireEvent.click(saveButton[0]);

    await waitFor(() => {
      expect(screen.getByText("mojombo_edited")).toBeInTheDocument();
      expect(screen.queryByText("mojombo")).not.toBeInTheDocument();
    });
    expect(userStore.cats[0].name).toBe('mojombo_edited')
  });

  test("Удаление элемента из списка", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCats),
      })
    ) as jest.Mock;

    await act(async () => {
      render(<Test />);
      await waitFor(() => userStore.isLoading === "alive");
    });
    expect(userStore.cats).toHaveLength(2);
    const deleteButton = screen.getAllByTestId("button_delete");

    fireEvent.click(deleteButton[0]);

    expect(userStore.cats).toHaveLength(1);
    expect(screen.queryByText("someBreed")).not.toBeInTheDocument();
    expect(screen.getByText("anotherBreed")).toBeInTheDocument();
  });
});
