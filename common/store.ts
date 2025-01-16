import { makeAutoObservable, runInAction } from "mobx";
import { TCat, TLoading } from "../types/TGlobal";

export class UserStore {
  users: TCat[] = [];
  startUser: number = 0;
  isEditing: boolean = false;
  editingCat: TCat = null;
  inputName: string = "";
  radioSort: boolean = true
  isLoading: TLoading = "alive"
  amountCats: number = 0
  cats: TCat[] = []

  token: string = "live_pMU4GZY4GfnSQ22faKE7PiefgBnRD1inDGyikftWXnyJNpS2e3UMQghUo21fuije"

  constructor() {
    makeAutoObservable(this);
  }

  async getCats () {
    this.isLoading = "loading"
    try {
      const resp = await fetch(`https://api.thecatapi.com/v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&page=${this.amountCats+10}&limit=10`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.token
        },
        redirect: 'follow'
      })
      .then(response => response.json())
      .then(result => {
        return result
      })

      runInAction(() => {
        resp.map(cat => {
          this.cats.push(
            {
              url: cat.url,
              id: cat.id,
              name: cat.breeds[0].name,
              like: false
            }
          )
        })

        this.amountCats = this.amountCats + 10
        this.isLoading = "alive"
      })
    } catch (error) {
      console.log(error)
      runInAction(() => {
        this.isLoading = "dead"
      })
    }
  }

  // Событие сохранения изменений
  handleSave = () => {
    const updateCats: TCat[] = this.cats.map((cat: TCat) => {
      return cat.id === this.editingCat.id ? {...this.editingCat, name: this.inputName} : cat
    })

    runInAction(() => {
      this.cats = [...updateCats]
      this.inputName = ""
      this.editingCat = null
      this.isEditing = false
    })
  }

  // Событие редактирования
  handleEdit (cat: TCat) {
    runInAction(() => {
      this.editingCat = cat
      this.inputName = cat.name
      this.isEditing = true
    })
  }

  // Событие удаления элемента
  handleDelete (currentCat: TCat) {
    runInAction(() => {
      const updateCats: TCat[] = this.cats.filter(cat => cat.id !== currentCat.id)
      this.cats = updateCats
    })
  }

  // Сортировка списка
  sortUsersLogin = () => {
    runInAction(() => {
      if (this.radioSort) {
        this.users.sort((a, b) => a.name.localeCompare(b.name));
        this.radioSort = !this.radioSort
      } else {
        this.users.sort((a, b) => b.name.localeCompare(a.name));
        this.radioSort = !this.radioSort
      }
    })
  }
}
