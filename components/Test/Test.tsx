import React, { useEffect, useRef, Fragment } from "react";
import styles from "./styles.module.scss"
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  CircularProgress,
  ListItemAvatar,
  Avatar,
  Tooltip,
  IconButton,
  TextField,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SortIcon from '@mui/icons-material/Sort'

import { v4 as uuidv4 } from "uuid"; // Для определения key у элементов списка без повторений

import { UserStore } from "../../common/store";
import { observer } from "mobx-react-lite";
import { TCat } from "../../types/TGlobal";

export const userStore = new UserStore ();

export const Test = observer(() => {
  const listRef = useRef(null)
  useEffect(() => {
    userStore.getCats()
  }, [])

  // Изменение users при достаточном скролле
  useEffect(() => {
    const handleScroll = async () => {
      if (userStore.isLoading === "alive") {
        const scrollTop: number = listRef.current.scrollTop
        const scrollHeight: number = listRef.current.scrollHeight;
        const clientHeight: number = listRef.current.clientHeight;

        if (scrollTop + clientHeight >= scrollHeight - 150) {
          await userStore.getCats()
        }
      }
    }

    if (listRef.current) {
      listRef.current.addEventListener('scroll', handleScroll);

      return () => {
        if (listRef.current) {
          listRef.current.removeEventListener('scroll', handleScroll);
        }
      };
    }
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'lightgray',
      }}
    >
      <Box
        ref={listRef}
        role="user_list"
        sx={{
          width: '500px',
          height: '300px',
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '20px',
          overflow: 'auto',
        }}
      >
        <Typography variant="h5" align="center" mb={2}>
          Пользователи
        </Typography>

        <IconButton data-testid="button_sort" onClick={userStore.sortUsersLogin}>
          {userStore.radioSort ? "z-a" : "a-z"}
          <SortIcon sx={{marginLeft: "10px"}}/>
        </IconButton>

        <List>
          {userStore.cats.map((cat: TCat) => {
            return (
              <Fragment key={uuidv4()}>
                <ListItem data-testid="user_item">
                  <ListItemAvatar>
                    <Avatar alt="Аватар" src={cat.url} />
                  </ListItemAvatar>

                  {/* Открытие события редактирования */}
                  {userStore.isEditing && cat.id === userStore.editingCat.id ?
                  (
                    <>
                      <TextField
                        data-testid="item_input"
                        fullWidth
                        defaultValue={userStore.inputName}
                        onBlur={(e) =>{
                          userStore.inputName = e.target.value
                        }}
                      />

                      <IconButton data-testid="button_save" className={styles.save_button} onClick={userStore.handleSave}>
                        <CheckCircleIcon className={styles.icon}/>
                      </IconButton>
                    </>
                  ) :
                  (
                    <>
                      <ListItemText primary={cat.name} />

                      <Tooltip title="Редактировать">
                        <IconButton data-testid="button_edit" className={styles.edit_button} onClick={(e) => userStore.handleEdit(cat)}>
                          <EditIcon className={styles.icon} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Удалить">
                        <IconButton data-testid="button_delete" className={styles.delete_button} onClick={(e) => userStore.handleDelete(cat)}>
                          <DeleteIcon className={styles.icon} />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </ListItem>
                <Divider />
              </Fragment>
            )
          })}

          {/* Загрузка при ожидании данных */}
          {userStore.isLoading === "loading" ? (
            <Box data-testid='loader' sx={{ textAlign: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          ):
            userStore.isLoading === "dead" ? <div>Ошибка загрузки</div> : ""}
        </List>
      </Box>
    </Box>
  )
})
