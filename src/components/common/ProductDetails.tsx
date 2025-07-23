import { Ionicons } from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker"
import * as ImagePicker from "expo-image-picker"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { getAdminCategories } from "../../services/adminService"
import { productService } from "../../services/product"

const { width } = Dimensions.get("window")

// Constants
const DEFAULT_IMAGE_PATH = "https://via.placeholder.com/400x400?text=Product+Image"

interface InventoryItem {
  size: string | number
  color: string
  quantity: number
  images: string[]
  isAvailable?: boolean
}

const emptyProduct = {
  name: "",
  summary: "",
  description: "",
  brand: "",
  category: "",
  sku: "",
  tags: [] as string[],
  status: true,
  price: {
    regular: 0,
    discountPercent: 0,
    isOnSale: false,
  },
  stock: 0,
  sales: 0,
  variants: {
    sizes: [] as (string | number)[],
    colors: [] as string[],
  },
  inventory: [] as InventoryItem[],
  mainImage: "",
  images: [] as string[],
  rating: 0,
  isNew: false,
}

const brandOptions = ["Nike", "Adidas", "Puma", "Reebok", "New Balance", "Converse", "Vans"]
const sizeOptions = Array.from({ length: 21 }, (_, i) => 30 + i)
const colorOptions = [
  { label: "Black", value: "Black", hex: "#000000" },
  { label: "White", value: "White", hex: "#FFFFFF" },
  { label: "Red", value: "Red", hex: "#FF0000" },
  { label: "Blue", value: "Blue", hex: "#0000FF" },
  { label: "Green", value: "Green", hex: "#008000" },
  { label: "Yellow", value: "Yellow", hex: "#FFFF00" },
  { label: "Gray", value: "Gray", hex: "#808080" },
  { label: "Brown", value: "Brown", hex: "#A52A2A" },
  { label: "Navy", value: "Navy", hex: "#000080" },
  { label: "Pink", value: "Pink", hex: "#FFC0CB" },
]

const STOCK_THRESHOLDS = {
  OUT_OF_STOCK: 0,
  LOW_STOCK: 10,
  MEDIUM_STOCK: 50,
  ITEM_LOW_STOCK: 5,
}

// Helper functions
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

const calculateTotalStock = (inventory: any[]) => {
  return inventory.reduce((total, item) => total + (item.quantity || 0), 0)
}

const updateVariantsFromInventory = (inventory: any[]) => {
  const sizes = [...new Set(inventory.map((item) => item.size).filter(Boolean))]
  const colors = [...new Set(inventory.map((item) => item.color).filter(Boolean))]
  return { sizes, colors }
}

interface ProductDetailsProps {
  isEdit?: boolean
  productId?: string
  onSave?: (product: any) => void
  onCancel?: () => void
}

export default function ProductDetails({ isEdit = false, productId, onSave, onCancel }: ProductDetailsProps) {
  const [product, setProduct] = useState(emptyProduct)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false)
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null)
  const [newInventoryItem, setNewInventoryItem] = useState({
    size: "",
    color: "",
    quantity: 0,
    images: [] as string[],
  })
  const [validationErrors, setValidationErrors] = useState<any>({})

  useEffect(() => {
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const cats = await getAdminCategories();
        setCategories(cats);
      } catch (err) {
        setCategories([]);
      }
    };
    fetchCategories();
    // Nếu là edit thì fetch chi tiết sản phẩm
    const fetchProduct = async () => {
      if (isEdit && productId) {
        try {
          const res = await productService.getProductById(productId);
          if (res && res.data) {
            // Nếu category là object, lấy _id
            let prod = res.data;
            if (prod.category && typeof prod.category === 'object' && (prod.category as any)._id) {
              prod = { ...prod, category: (prod.category as any)._id };
            }
            setProduct({ ...emptyProduct, ...prod });
          }
        } catch (err) {
          // Có thể show lỗi nếu cần
        }
      }
    };
    fetchProduct();
  }, [isEdit, productId]);

  const handleChange = (field: string, value: any) => {
    // Nếu chọn category thì lưu objectId
    if (field === "category") {
      setProduct({ ...product, category: value });
      if (validationErrors[field]) {
        const newErrors = { ...validationErrors };
        delete newErrors[field];
        setValidationErrors(newErrors);
      }
      return;
    }
    const updatedProduct = { ...product, [field]: value }
    setProduct(updatedProduct)

    // Clear validation error for this field
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors }
      delete newErrors[field]
      setValidationErrors(newErrors)
    }
  }

  const handleNestedChange = (
    parentField: "price",
    childField: keyof typeof emptyProduct.price,
    value: any,
  ) => {
    const updatedProduct = {
      ...product,
      [parentField]: {
        ...product[parentField],
        [childField]: value,
      },
    }
    setProduct(updatedProduct)
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission needed", "Sorry, we need camera roll permissions to upload images!")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: true,
    })

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri)
      const updatedImages = [...product.images, ...newImages]
      setProduct((prev) => ({
        ...prev,
        images: updatedImages,
        mainImage: prev.mainImage || newImages[0],
      }))
    }
  }

  const removeImage = (imageUri: string) => {
    const updatedImages = product.images.filter((img) => img !== imageUri)
    setProduct((prev) => ({
      ...prev,
      images: updatedImages,
      mainImage: prev.mainImage === imageUri ? updatedImages[0] || "" : prev.mainImage,
    }))
  }

  // Thêm hàm chọn ảnh cho inventory item
  const pickInventoryImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Sorry, we need camera roll permissions to upload images!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: true,
    });
    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      setNewInventoryItem((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...newImages],
      }));
    }
  };
  const removeInventoryImage = (imageUri: string) => {
    setNewInventoryItem((prev) => ({
      ...prev,
      images: prev.images.filter((img: string) => img !== imageUri),
    }));
  };

  const validateProduct = () => {
    const errors: any = {}

    if (!product.name.trim()) errors.name = "Product name is required"
    if (!product.summary.trim()) errors.summary = "Product summary is required"
    if (!product.description.trim()) errors.description = "Product description is required"
    if (!product.category) errors.category = "Category is required"
    if (!product.brand) errors.brand = "Brand is required"
    if (!product.price.regular || product.price.regular <= 0) errors.price = "Valid price is required"
    // Bỏ validate ảnh
    // if (product.images.length === 0) errors.images = "At least one image is required"
    if (product.inventory.length === 0) errors.inventory = "At least one inventory item is required"

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateProduct()) {
      Alert.alert("Validation Error", "Please fix all validation errors before saving")
      return
    }

    setLoading(true)
    try {
      // Calculate total stock and variants
      const totalStock = calculateTotalStock(product.inventory)
      const variants = updateVariantsFromInventory(product.inventory)

      const finalProduct = {
        ...product,
        stock: totalStock,
        variants,
      }

      // In a real app, make API call here
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      Alert.alert("Success", `Product ${isEdit ? "updated" : "created"} successfully!`)
      onSave?.(finalProduct)
    } catch (error) {
      Alert.alert("Error", `Failed to ${isEdit ? "update" : "create"} product`)
    } finally {
      setLoading(false)
    }
  }

  const openInventoryModal = (item?: any) => {
    setEditingInventoryItem(item)
    if (item) {
      setNewInventoryItem(item)
    } else {
      setNewInventoryItem({
        size: "",
        color: "",
        quantity: 0,
        images: [],
      })
    }
    setInventoryModalVisible(true)
  }

  const handleInventorySubmit = () => {
    if (!newInventoryItem.size || !newInventoryItem.color || newInventoryItem.quantity < 0) {
      Alert.alert("Validation Error", "Please fill in all required fields")
      return
    }

    let updatedInventory
    if (editingInventoryItem) {
      updatedInventory = product.inventory.map((item) =>
        item.size === editingInventoryItem.size && item.color === editingInventoryItem.color
          ? { ...newInventoryItem, isAvailable: newInventoryItem.quantity > 0 }
          : item,
      )
    } else {
      const existingItem = product.inventory.find(
        (item) => item.size === newInventoryItem.size && item.color === newInventoryItem.color,
      )
      if (existingItem) {
        Alert.alert("Error", "This size and color combination already exists!")
        return
      }
      updatedInventory = [...product.inventory, { ...newInventoryItem, isAvailable: newInventoryItem.quantity > 0 }]
    }

    setProduct((prev) => ({ ...prev, inventory: updatedInventory }))
    setInventoryModalVisible(false)
    setEditingInventoryItem(null)
  }

  const deleteInventoryItem = (size: string, color: string) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this inventory item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedInventory = product.inventory.filter((item) => !(item.size === size && item.color === color))
          setProduct((prev) => ({ ...prev, inventory: updatedInventory }))
        },
      },
    ])
  }

  const getStockStatus = () => {
    const stock = calculateTotalStock(product.inventory)
    if (stock === STOCK_THRESHOLDS.OUT_OF_STOCK) {
      return { status: "error", text: "Out of Stock", color: "#ff4d4f" }
    }
    if (stock <= STOCK_THRESHOLDS.LOW_STOCK) {
      return { status: "warning", text: "Low Stock", color: "#faad14" }
    }
    if (stock <= STOCK_THRESHOLDS.MEDIUM_STOCK) {
      return { status: "normal", text: "In Stock", color: "#1890ff" }
    }
    return { status: "success", text: "Well Stocked", color: "#52c41a" }
  }

  const stockStatus = getStockStatus()

  const renderInventoryItem = ({ item }: { item: any }) => {
    const colorOption = colorOptions.find((opt) => opt.value === item.color)
    return (
      <View style={styles.inventoryItem}>
        <View style={styles.inventoryInfo}>
          <View style={styles.inventoryRow}>
            <Text style={styles.inventoryLabel}>Size: {item.size}</Text>
            <View style={styles.colorInfo}>
              <View style={[styles.colorDot, { backgroundColor: colorOption?.hex || "#ccc" }]} />
              <Text style={styles.inventoryLabel}>{item.color}</Text>
            </View>
          </View>
          <Text style={styles.inventoryQuantity}>Quantity: {item.quantity}</Text>
          <Text
            style={[
              styles.inventoryStatus,
              {
                color:
                  item.quantity > STOCK_THRESHOLDS.ITEM_LOW_STOCK
                    ? "#52c41a"
                    : item.quantity > 0
                      ? "#faad14"
                      : "#ff4d4f",
              },
            ]}
          >
            {item.quantity === 0
              ? "Out of Stock"
              : item.quantity <= STOCK_THRESHOLDS.ITEM_LOW_STOCK
                ? "Low Stock"
                : "In Stock"}
          </Text>
        </View>
        <View style={styles.inventoryActions}>
          <TouchableOpacity style={styles.editButton} onPress={() => openInventoryModal(item)}>
            <Ionicons name="pencil" size={16} color="#1890ff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => deleteInventoryItem(item.size, item.color)}>
            <Ionicons name="trash" size={16} color="#ff4d4f" />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{isEdit ? "Edit Product" : "Add New Product"}</Text>
          <View style={[styles.stockBadge, { backgroundColor: stockStatus.color + "20" }]}>
            <Text style={[styles.stockText, { color: stockStatus.color }]}>
              {stockStatus.text}: {calculateTotalStock(product.inventory)} units
            </Text>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={[styles.input, validationErrors.name && styles.inputError]}
              placeholder="Enter product name"
              value={product.name}
              onChangeText={(text) => handleChange("name", text)}
            />
            {validationErrors.name && <Text style={styles.errorText}>{validationErrors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Summary *</Text>
            <TextInput
              style={[styles.input, validationErrors.summary && styles.inputError]}
              placeholder="Brief product summary"
              value={product.summary}
              onChangeText={(text) => handleChange("summary", text)}
              multiline
              numberOfLines={2}
            />
            {validationErrors.summary && <Text style={styles.errorText}>{validationErrors.summary}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Description *</Text>
            <TextInput
              style={[styles.textArea, validationErrors.description && styles.inputError]}
              placeholder="Detailed product description"
              value={product.description}
              onChangeText={(text) => handleChange("description", text)}
              multiline
              numberOfLines={4}
            />
            {validationErrors.description && <Text style={styles.errorText}>{validationErrors.description}</Text>}
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Category *</Text>
              <View style={[styles.pickerContainer, validationErrors.category && styles.inputError]}>
                <Picker
                  selectedValue={product.category}
                  onValueChange={(value) => handleChange("category", value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a category" value="" />
                  {categories.map((cat) => (
                    <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
                  ))}
                </Picker>
              </View>
              {validationErrors.category && <Text style={styles.errorText}>{validationErrors.category}</Text>}
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Brand *</Text>
              <View style={[styles.pickerContainer, validationErrors.brand && styles.inputError]}>
                <Picker
                  selectedValue={product.brand}
                  onValueChange={(value) => handleChange("brand", value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a brand" value="" />
                  {brandOptions.map((brand) => (
                    <Picker.Item key={brand} label={brand} value={brand} />
                  ))}
                </Picker>
              </View>
              {validationErrors.brand && <Text style={styles.errorText}>{validationErrors.brand}</Text>}
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Sales</Text>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Regular Price * (₫)</Text>
              <TextInput
                style={[styles.input, validationErrors.price && styles.inputError]}
                placeholder="0"
                value={product.price.regular.toString()}
                onChangeText={(text) => handleNestedChange("price", "regular", Number.parseFloat(text) || 0)}
                keyboardType="numeric"
              />
              {validationErrors.price && <Text style={styles.errorText}>{validationErrors.price}</Text>}
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Discount (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={product.price.discountPercent.toString()}
                onChangeText={(text) => handleNestedChange("price", "discountPercent", Number.parseFloat(text) || 0)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>On Sale</Text>
              <Switch
                value={product.price.isOnSale}
                onValueChange={(value) => handleNestedChange("price", "isOnSale", value)}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={product.price.isOnSale ? "#f5dd4b" : "#f4f3f4"}
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Sale Price</Text>
              <Text style={styles.priceDisplay}>
                {formatPrice(product.price.regular * (1 - product.price.discountPercent / 100))}
              </Text>
            </View>
          </View>
        </View>

        {/* Product Gallery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Gallery ({product.images.length})</Text>

          {product.mainImage && (
            <View style={styles.mainImageContainer}>
              <Image source={{ uri: product.mainImage }} style={styles.mainImage} />
              <Text style={styles.mainImageLabel}>Main Image</Text>
            </View>
          )}

          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Ionicons name="camera" size={24} color="#1890ff" />
            <Text style={styles.uploadText}>Add Images</Text>
          </TouchableOpacity>
          {validationErrors.images && <Text style={styles.errorText}>{validationErrors.images}</Text>}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
            {product.images.map((image, index) => (
              <View key={index} style={styles.imageItem}>
                <Image source={{ uri: image }} style={styles.thumbnailImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(image)}>
                  <Ionicons name="close-circle" size={20} color="#ff4d4f" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Inventory Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Inventory Management ({product.inventory.length})</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => openInventoryModal()}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
          {validationErrors.inventory && <Text style={styles.errorText}>{validationErrors.inventory}</Text>}

          <FlatList
            data={product.inventory}
            renderItem={renderInventoryItem}
            keyExtractor={(item) => `${item.size}-${item.color}`}
            scrollEnabled={false}
            ListEmptyComponent={<Text style={styles.emptyText}>No inventory items added yet</Text>}
          />
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Product Status</Text>
              <Switch
                value={product.status}
                onValueChange={(value) => handleChange("status", value)}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={product.status ? "#f5dd4b" : "#f4f3f4"}
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>New Product</Text>
              <Switch
                value={product.isNew}
                onValueChange={(value) => handleChange("isNew", value)}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={product.isNew ? "#f5dd4b" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>{isEdit ? "Update Product" : "Create Product"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Inventory Modal */}
      <Modal visible={inventoryModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingInventoryItem ? "Edit Inventory Item" : "Add Inventory Item"}</Text>
            <TouchableOpacity onPress={() => setInventoryModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Size *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newInventoryItem.size}
                    onValueChange={(value) => setNewInventoryItem((prev) => ({ ...prev, size: value }))}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select size" value="" />
                    {sizeOptions.map((size) => (
                      <Picker.Item key={size} label={`Size ${size}`} value={size} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.label}>Color *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newInventoryItem.color}
                    onValueChange={(value) => setNewInventoryItem((prev) => ({ ...prev, color: value }))}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select color" value="" />
                    {colorOptions.map((color) => (
                      <Picker.Item key={color.value} label={color.label} value={color.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter quantity"
                value={newInventoryItem.quantity.toString()}
                onChangeText={(text) =>
                  setNewInventoryItem((prev) => ({ ...prev, quantity: Number.parseInt(text) || 0 }))
                }
                keyboardType="numeric"
              />
            </View>
            {/* Inventory Images */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Images</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={pickInventoryImage}>
                <Ionicons name="camera" size={24} color="#1890ff" />
                <Text style={styles.uploadText}>Add Images</Text>
              </TouchableOpacity>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
                {newInventoryItem.images && newInventoryItem.images.map((image: string, idx: number) => (
                  <View key={idx} style={styles.imageItem}>
                    <Image source={{ uri: image }} style={styles.thumbnailImage} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => removeInventoryImage(image)}>
                      <Ionicons name="close-circle" size={20} color="#ff4d4f" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setInventoryModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleInventorySubmit}>
              <Text style={styles.saveButtonText}>{editingInventoryItem ? "Update" : "Add"}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  stockText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#ff4d4f",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 100,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#ff4d4f",
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  halfWidth: {
    width: "48%",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  priceDisplay: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#52c41a",
    marginTop: 8,
  },
  mainImageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  mainImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
  },
  mainImageLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1890ff",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    color: "#1890ff",
    marginLeft: 8,
    fontWeight: "600",
  },
  imageList: {
    flexDirection: "row",
  },
  imageItem: {
    position: "relative",
    marginRight: 12,
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1890ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  inventoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
  },
  inventoryInfo: {
    flex: 1,
  },
  inventoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  inventoryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  colorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inventoryQuantity: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  inventoryStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
  inventoryActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    fontStyle: "italic",
    padding: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#333",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#333",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
})
