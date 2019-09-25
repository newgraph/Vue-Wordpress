Vue.productionTip = false;
window.vEvent = new Vue();

Vue.component('button-cta', {
  template: `<button @click="$emit('click')"><slot/></button>`
})

Vue.component('pill', {
  template: `<span class="pill"><slot/></span>`
})

Vue.component('deluxe-switch', {
  props: ['label1', 'label2', 'selectedVal', 'id'],
  template: `<div class="pricing-switcher">
              <div class="fieldset">
                <input @change="$emit('change', label1)" type="radio" name="group-a" :value="label1" :id="id1" checked>
                <label :for="id1" :class="{active: selectedVal == label1}">{{label1}}</label>
                <input @change="$emit('change', label2)" type="radio" name="group-a" :value="label2" :id="id2">
                <label :for="id2" :class="{active: selectedVal == label2}">{{label2}}</label>
                <span class="switch" :class="{move: selectedVal == label2}"></span>
              </div>
            </div>`,
  data() {
    return {
      id1: 'opt1' + this.id,
      id2: 'opt2' + this.id
    }
  }
})

Vue.component('meal-section', {
  props: ['title', 'section'],
  template: `<div v-if="Object.keys(section).length" class="meal-section">
              <h3 class="section-title">{{title}}</h3>
              <div class="section-details">
                <slot>
                  <p class="empty"><small>Nothing here</small><br>Try the Deluxe Package!</p>
                </slot>
              </div>
            </div>`
})


Vue.component('food-component', {
  props: ['title', 'desc', 'comp', 'inPackage', 'inSection', 'isDeluxe'],
  template: `<div  class="food-component">
                <div class="component-title">
                  <h5 class="b">{{title}}</h5>
                  <p class="component-desc">{{desc}}</p>
                </div>

                <div class="component-details">
                  <slot/>
                </div>

                <div class="component-pills">
                  <pill>{{qtyIncluded}} included</pill>
                  <pill class="green" v-if="addedCost">+\${{addedCost}}</pill>
                </div>
              </div>`,
  data() {
    return {
      componentData: this.comp,
    }
  },
  computed: {
    selected() { return this.comp[this.isDeluxe ? 'selected_deluxe' : 'selected_basic'] },
    qtyIncluded() {
      return this.isDeluxe ? this.comp.info.qty_free_deluxe : this.comp.info.qty_free
    },
    addedCost() {
      let qtyFree = Number(this.qtyIncluded)
      if (this.selected.length > qtyFree) {
        let extras = this.selected.slice(qtyFree)
        let addedCost = 0;
        extras.forEach(id => {
          if (this.componentData.items[id]) { // not null
            addedCost += Number(this.componentData.items[id].price)
          }
        })
        return addedCost
      } else {
        return 0
      }
    }
  }
})

Vue.component('food-dropdown', {
  props: ['emptyText', 'inPackage', 'inSection', 'inComponent', 'selection', 'addBtn', 'index', 'comp', 'isDeluxe'],
  template: `<div class="dropdown-wrapper">
                <div @click="isOpen = !isOpen" :class="{noSelection: !selection}" class="dropdown" ref="dropdownMenu">
                  {{label}}
                  <span class="arrow-down-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" viewBox="0 0 24 24" class="icon-cheveron-selection"><path class="secondary" fill-rule="evenodd" d="M8.7 9.7a1 1 0 1 1-1.4-1.4l4-4a1 1 0 0 1 1.4 0l4 4a1 1 0 1 1-1.4 1.4L12 6.42l-3.3 3.3zm6.6 4.6a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4l3.3 3.29 3.3-3.3z"/></svg>
                  </span>
                </div>
                <transition name="slide-in">
                  <div v-if="isOpen" class="dropdown-options">
                    <slot/>
                  </div>
                </transition>
                <button-cta v-if="addBtn" @click="addLine" class="only-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22px" viewBox="0 0 24 24" class="icon-add-circle"><circle cx="12" cy="12" r="10" class="primary"/><path class="secondary" d="M13 11h4a1 1 0 0 1 0 2h-4v4a1 1 0 0 1-2 0v-4H7a1 1 0 0 1 0-2h4V7a1 1 0 0 1 2 0v4z"/></svg>
                </button-cta>
                <button-cta v-if="addBtn && comp[isDeluxe? 'selected_deluxe' : 'selected_basic'].length > 1" @click="removeLine" class="only-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22px" viewBox="0 0 24 24" class="icon-remove-circle"><circle cx="12" cy="12" r="10" class="primary"/><rect width="12" height="2" x="6" y="11" class="secondary" rx="1"/></svg>
                </button-cta>
              </div>`,
  data() {
    return {
      isOpen: false,
    }
  },
  computed: {
    label() {
      if (this.selection) {
        return this.comp.items[this.selection].name
      } else {
        return this.emptyText
      }
    }
  },
  methods: {
    addLine() {
      vEvent.$emit(`${this.inPackage}addline`, {
        package: this.inPackage,
        section: this.inSection,
        component: this.inComponent,
      })
    },
    removeLine() {
      vEvent.$emit(`${this.inPackage}removeline`, {
        package: this.inPackage,
        section: this.inSection,
        component: this.inComponent,
      })
    },
    documentClick(e) {
      let el = this.$refs.dropdownMenu
      let target = e.target
      if ((el !== target) && !el.contains(target)) {
        this.isOpen = false
      }
    }
  },
  created() {
    document.addEventListener('click', this.documentClick)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.documentClick)
  }
})


Vue.component('dropdown-item', {
  props: ['name', 'price', 'image', 'inPackage', 'inSection', 'inComponent', 'itemId', 'index'],
  template: `<div @click="onSelect" class="dropdown-item">
                <img v-if="image" :src="image">
                <div class="info">
                  <h5>{{name}}</h5>
                  <p v-if="price">\${{price}}</p>
                </div>
             </div>`,
  methods: {
    onSelect() {
      vEvent.$emit(`${this.inPackage}foodoptionselect`, {
        package: this.inPackage,
        section: this.inSection,
        component: this.inComponent,
        itemName: this.name,
        itemId: this.itemId,
        index: this.index,
      })
    }
  }
})

var shabbosPackageMixin = {
  data() {
    return {
      packageName: null,
      packageId: null,
      stock: {
        manage: false,
        inStock: true,
        qty: 0
      },
      basePrice: {
        basic: 0,
        deluxe: 0
      },
      packageData: {},
      selectedPackage: 'Basic',
      quantity: 2,
      addToCartUrl: '',
    }
  },
  computed: {
    isDeluxe() { return this.selectedPackage == 'Deluxe' },
    selectedVarName() { return this.isDeluxe ? 'selected_deluxe' : 'selected_basic' },
    packagePrice() {
      return this.isDeluxe ? this.basePrice.deluxe : this.basePrice.basic
    },
    extraPrice() {
      let sum = 0
      for (let section in this.packageData) {
        for (let comp in this.packageData[section]) {
          let qtyFree = this.packageData[section][comp].info[this.isDeluxe ? 'qty_free_deluxe' : 'qty_free']
          let extras = this.packageData[section][comp][this.selectedVarName].slice(qtyFree)
          extras.forEach(id => {
            if (this.packageData[section][comp].items[id]) {
              sum += Number(this.packageData[section][comp].items[id].price)
            }
          })
        }
      }
      return sum
    },
    wooco_ids() {
      let selectedIds = {}
      for (let section in this.packageData) {
        for (let comp in this.packageData[section]) {
          let sel = this.packageData[section][comp][this.selectedVarName]
          sel.forEach(id => {
            if (id) { // not null
              if (!selectedIds.hasOwnProperty(id)) {
                selectedIds[id] = 1
              } else {
                selectedIds[id] += 1
              }
            }
          })
        }
      }

      let finalIds = [];
      for (let key in selectedIds) {
        finalIds.push(`${key}/${selectedIds[key]}`) // = ID/QTY
      }
      console.log('wooco_ids', finalIds.join(','));

      return finalIds.join(',')
    }
  },
  methods: {
    onDeluxeChange(e) {
      this.selectedPackage = e

      for (let section in this.packageData) {
        for (let component in this.packageData[section]) {
          this.packageData[section][component].selected =
            e == 'Basic' ?
              this.packageData[section][component].selected_basic :
              this.packageData[section][component].selected_deluxe;
        }
      }
    },
    triggerAddToCart() {
      this.$refs.addToCartBtn.$el.click();
    }
  },
  mounted() {
    let package_data = JSON.parse(this.$refs.packageData.textContent)
    this.packageName = package_data.package_name
    this.packageId = package_data.package_id
    this.stock = {
      manage: package_data.manage_stock,
      inStock: package_data.is_in_stock,
      qty: package_data.stock_qty,
    }
    this.basePrice = {
      basic: Number(package_data.price),
      deluxe: Number(package_data.deluxe_price),
    }
    this.addToCartUrl = package_data.addToCartUrl
    this.packageData = package_data.sections_items

    this.quantity = package_data.people || 2
    if (package_data.date) this.$refs.dateInput.value = package_data.date

    console.log(package_data);
    console.log(this.$data);
    console.log(package_data.addToCartUrl);

    // onDDselect
    vEvent.$on(`${this.packageName}foodoptionselect`, data => {
      // console.log('Selected: ', data)
      this.$set(
        this.packageData[data.section][data.component][this.selectedVarName], data.index, data.itemId
      )
    })
    // onAddLine
    vEvent.$on(`${this.packageName}addline`, data => {
      this.packageData[data.section][data.component][this.selectedVarName].push(null);
    })
    // onRemoveLine
    vEvent.$on(`${this.packageName}removeline`, data => {
      this.packageData[data.section][data.component][this.selectedVarName].pop();
    })
  },
}
