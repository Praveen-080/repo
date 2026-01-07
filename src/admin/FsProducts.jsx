import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { getCategories } from '@/services/mockApi';
import { uploadImageToCloudinary } from '@/services/cloudinaryUpload';
import { 
  getProducts, 
  createProduct, 
  deleteProduct, 
  updateProduct 
} from '@/services/firestoreProducts';
import notify from '@/lib/notify';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Loader2, Trash2, Edit, Check, X } from 'lucide-react';

export default function FsProducts() {
  const { adminUser } = useAdminAuth();
  const [form, setForm] = useState({
    name_english: '', 
    name_tamil: '', 
    name_tanglish: '', 
    category: 'sea_fish', 
    price_per_kg: '', 
    stock_type: 'kg', 
    stock_kg: '', 
    count: '', 
    description: '',
    is_available: true
  });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const categories = getCategories();

  const load = async () => {
    try { 
      const products = await getProducts({ includeUnavailable: true }); 
      setList(products);
    } catch (err) { 
      console.error('Failed to load products:', err);
      setList([]); 
    }
  };
  
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }, [file]);

  const submit = async (e) => {
    e.preventDefault();
    if (!adminUser) return notify.error('Admin session required');
    
    if (!form.name_english) return notify.warning('English name required');
    if (!file && !editingId) return notify.warning('Please select an image');
    
    setLoading(true);
    try {
      let imageData = {};
      
      // Upload image to Cloudinary if file selected
      if (file) {
        setUploading(true);
        const uploadResult = await uploadImageToCloudinary(file);
        imageData = {
          image_url: uploadResult.secure_url,
          image_public_id: uploadResult.public_id
        };
        setUploading(false);
      }
      
      const productData = {
        name_english: form.name_english.trim(),
        name_tamil: form.name_tamil.trim(),
        name_tanglish: form.name_tanglish.trim(),
        category: form.category,
        price_per_kg: Number(form.price_per_kg) || 0,
        stock_type: form.stock_type,
        stock_kg: Number(form.stock_kg) || 0,
        count: Number(form.count) || 0,
        description: form.description.trim(),
        is_available: form.is_available,
        ...imageData
      };
      
      if (editingId) {
        // Update existing product
        await updateProduct(editingId, productData);
        notify.success('Product updated successfully!');
        setEditingId(null);
      } else {
        // Create new product
        await createProduct(productData);
        notify.success('Product added successfully!');
      }
      
      // Reset form
      setForm({
        name_english: '', 
        name_tamil: '', 
        name_tanglish: '', 
        category: 'sea_fish', 
        price_per_kg: '', 
        stock_type: 'kg', 
        stock_kg: '', 
        count: '', 
        description: '',
        is_available: true
      });
      setFile(null);
      setImagePreview(null);
      await load();
    } catch (err) {
      console.error('Submit error:', err);
      notify.error(err?.message || 'Failed to save product');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const startEdit = (product) => {
    setForm({
      name_english: product.name_english || '',
      name_tamil: product.name_tamil || '',
      name_tanglish: product.name_tanglish || '',
      category: product.category || 'sea_fish',
      price_per_kg: product.price_per_kg || '',
      stock_type: product.stock_type || 'kg',
      stock_kg: product.stock_kg || '',
      count: product.count || '',
      description: product.description || '',
      is_available: product.is_available !== undefined ? product.is_available : true
    });
    setEditingId(product.id);
    setImagePreview(product.image_url || null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      name_english: '', 
      name_tamil: '', 
      name_tanglish: '', 
      category: 'sea_fish', 
      price_per_kg: '', 
      stock_type: 'kg', 
      stock_kg: '', 
      count: '', 
      description: '',
      is_available: true
    });
    setFile(null);
    setImagePreview(null);
  };

  const remove = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await deleteProduct(id);
      notify.success('Product deleted successfully!');
      await load();
    } catch (err) {
      console.error('Delete error:', err);
      notify.error(err?.message || 'Delete failed');
    }
  };

  const toggleAvailability = async (product) => {
    try {
      await updateProduct(product.id, {
        is_available: !product.is_available
      });
      notify.success(`Product ${!product.is_available ? 'enabled' : 'disabled'}`);
      await load();
    } catch {
      notify.error('Failed to update availability');
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? 'Edit Product' : 'Add Product'} (Firestore + Cloudinary)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {/* Image Preview */}
            {imagePreview && (
              <div className="flex justify-center">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-lg border-2 border-primary/20"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>English Name *</Label>
                <Input 
                  value={form.name_english} 
                  onChange={(e) => setForm((f) => ({ ...f, name_english: e.target.value }))} 
                  placeholder="e.g., Seer Fish"
                  required 
                />
              </div>
              <div>
                <Label>Tamil Name</Label>
                <Input 
                  value={form.name_tamil} 
                  onChange={(e) => setForm((f) => ({ ...f, name_tamil: e.target.value }))} 
                  placeholder="e.g., வஞ்சிரம்"
                />
              </div>
            </div>
            
            <div>
              <Label>Tanglish Name</Label>
              <Input 
                value={form.name_tanglish} 
                onChange={(e) => setForm((f) => ({ ...f, name_tanglish: e.target.value }))} 
                placeholder="e.g., Vanjaram"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price / kg (₹) *</Label>
                <Input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={form.price_per_kg} 
                  onChange={(e) => setForm((f) => ({ ...f, price_per_kg: e.target.value }))} 
                  placeholder="0"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Stock Type *</Label>
                <Select value={form.stock_type} onValueChange={(v) => setForm((f) => ({ ...f, stock_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">By Weight (kg)</SelectItem>
                    <SelectItem value="count">By Count (pieces)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stock (kg) *</Label>
                <Input 
                  type="number" 
                  min="0"
                  step="0.5"
                  value={form.stock_kg} 
                  onChange={(e) => setForm((f) => ({ ...f, stock_kg: e.target.value }))} 
                  placeholder="0"
                  required
                  disabled={form.stock_type === 'count'}
                />
              </div>
              <div>
                <Label>Count (pieces) *</Label>
                <Input 
                  type="number" 
                  min="0"
                  step="1"
                  value={form.count} 
                  onChange={(e) => setForm((f) => ({ ...f, count: e.target.value }))} 
                  placeholder="0"
                  required
                  disabled={form.stock_type === 'kg'}
                />
              </div>
            </div>
            
            <div>
              <Label>Image {editingId && '(Leave empty to keep existing)'}</Label>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                required={!editingId}
              />
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Uploading image to Cloudinary...
                </div>
              )}
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea 
                value={form.description} 
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} 
                placeholder="Product description..."
                rows={3}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                checked={form.is_available}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, is_available: checked }))}
              />
              <Label>Product Available for Sale</Label>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={loading || uploading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploading ? 'Uploading...' : 'Saving...'}
                  </>
                ) : editingId ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Update Product
                  </>
                ) : (
                  'Add Product'
                )}
              </Button>
              
              {editingId && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products ({list.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {list.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No products yet</p>
                <p className="text-sm">Add your first product using the form</p>
              </div>
            )}
            
            {list.map((p) => (
              <div 
                key={p.id} 
                className={`flex items-center justify-between border rounded-lg p-3 transition-colors ${
                  !p.is_available ? 'bg-muted/50' : ''
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {p.image_url ? (
                    <img 
                      src={p.image_url} 
                      alt={p.name_english} 
                      className="w-16 h-16 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="font-semibold flex items-center gap-2">
                      {p.name_english}
                      {!p.is_available && (
                        <span className="text-xs px-2 py-0.5 bg-destructive/20 text-destructive rounded">
                          Unavailable
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {p.name_tamil}
                    </div>
                    <div className="text-sm mt-1">
                      <span className="font-medium text-primary">₹{p.price_per_kg || 0}/kg</span>
                      {' • '}
                      {p.stock_type === 'count' ? (
                        <span>{p.count || 0} pieces</span>
                      ) : (
                        <span>{p.stock_kg || 0}kg stock</span>
                      )}
                      {' • '}
                      <span className="text-muted-foreground">{p.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => toggleAvailability(p)}
                    title={p.is_available ? 'Mark as unavailable' : 'Mark as available'}
                  >
                    {p.is_available ? 'Disable' : 'Enable'}
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => startEdit(p)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => remove(p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
