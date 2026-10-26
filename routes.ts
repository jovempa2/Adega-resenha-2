import { Router, Request, Response, NextFunction } from 'express';
import { db } from './db.js';

export const apiRouter = Router();

// In-memory session tokens for admin authentication
const activeTokens = new Set<string>();

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autorizado. Faça login como administrador.' });
  }

  const token = authHeader.split(' ')[1];
  if (!activeTokens.has(token)) {
    return res.status(401).json({ error: 'Sessão expirada ou inválida.' });
  }

  next();
};

// ----------------- AUTH -----------------
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
  }

  if (username === 'admin' && db.verifyPassword(password)) {
    const token = `resenha_adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    activeTokens.add(token);
    return res.json({ success: true, token, user: { username: 'admin', role: 'administrator' } });
  }

  return res.status(401).json({ error: 'Credenciais inválidas. Verifique usuário e senha.' });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeTokens.delete(token);
  }
  return res.json({ success: true, message: 'Desconectado com sucesso.' });
});

apiRouter.get('/auth/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (activeTokens.has(token)) {
      return res.json({ valid: true, user: { username: 'admin', role: 'administrator' } });
    }
  }
  return res.json({ valid: false });
});

apiRouter.post('/auth/change-password', requireAdmin, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres.' });
  }

  const ok = db.updatePassword(currentPassword, newPassword);
  if (!ok) {
    return res.status(400).json({ error: 'Senha atual incorreta.' });
  }
  return res.json({ success: true, message: 'Senha atualizada com sucesso.' });
});

// ----------------- SETTINGS -----------------
apiRouter.get('/settings', (_req: Request, res: Response) => {
  res.json(db.getSettings());
});

apiRouter.put('/settings', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// ----------------- PRODUCTS -----------------
apiRouter.get('/products', (_req: Request, res: Response) => {
  res.json(db.getProducts());
});

apiRouter.post('/products', requireAdmin, (req: Request, res: Response) => {
  const { name, brand, category, description, volume, price, available, image } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
  }
  const newProduct = {
    id: `prod-${Date.now()}`,
    name,
    brand: brand || 'Adega Resenha',
    category: category || 'gin',
    description: description || '',
    volume: volume || '',
    price: Number(price),
    available: available !== undefined ? Boolean(available) : true,
    image: image || '/src/assets/images/custom_drink_copao_1792974928549.jpg'
  };
  const saved = db.saveProduct(newProduct);
  res.status(201).json(saved);
});

apiRouter.put('/products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.getProducts().find(p => p.id === id);
  if (!existing) {
    return res.status(404).json({ error: 'Produto não encontrado.' });
  }
  const updated = db.saveProduct({
    ...existing,
    ...req.body,
    id,
    price: Number(req.body.price ?? existing.price)
  });
  res.json(updated);
});

apiRouter.delete('/products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = db.deleteProduct(id);
  if (!ok) {
    return res.status(404).json({ error: 'Produto não encontrado.' });
  }
  res.json({ success: true, message: 'Produto removido com sucesso.' });
});

// ----------------- CUSTOMIZER (MONTE SEU COPO) -----------------
apiRouter.get('/customizer', (_req: Request, res: Response) => {
  res.json(db.getCustomizer());
});

apiRouter.put('/customizer', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateCustomizer(req.body);
  res.json(updated);
});

// ----------------- MONTE SEU ROSH -----------------
apiRouter.get('/rosh-customizer', (_req: Request, res: Response) => {
  res.json(db.getRoshCustomizer());
});

apiRouter.put('/rosh-customizer', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateRoshCustomizer(req.body);
  res.json(updated);
});

// ----------------- HOOKAHS -----------------
apiRouter.get('/hookahs', (_req: Request, res: Response) => {
  res.json(db.getHookahs());
});

apiRouter.post('/hookahs', requireAdmin, (req: Request, res: Response) => {
  const { name, brand, subcategory, description, price, available, image } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
  }
  const newItem = {
    id: `hk-${Date.now()}`,
    name,
    brand: brand || 'Hookah Resenha',
    subcategory: subcategory || 'acessorios',
    description: description || '',
    price: Number(price),
    available: available !== undefined ? Boolean(available) : true,
    image: image || '/src/assets/images/hookah_lounge_setup_1792974929241.jpg'
  };
  const saved = db.saveHookah(newItem);
  res.status(201).json(saved);
});

apiRouter.put('/hookahs/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.getHookahs().find(h => h.id === id);
  if (!existing) {
    return res.status(404).json({ error: 'Item de narguilé não encontrado.' });
  }
  const updated = db.saveHookah({
    ...existing,
    ...req.body,
    id,
    price: Number(req.body.price ?? existing.price)
  });
  res.json(updated);
});

apiRouter.delete('/hookahs/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = db.deleteHookah(id);
  if (!ok) {
    return res.status(404).json({ error: 'Item não encontrado.' });
  }
  res.json({ success: true, message: 'Item removido com sucesso.' });
});

// ----------------- COMBOS PRONTOS -----------------
apiRouter.get('/combos', (_req: Request, res: Response) => {
  res.json(db.getCombos());
});

apiRouter.post('/combos', requireAdmin, (req: Request, res: Response) => {
  const { name, description, itemsIncluded, price, originalPrice, available, validUntil, image } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
  }
  const newCombo = {
    id: `combo-${Date.now()}`,
    name,
    description: description || '',
    itemsIncluded: Array.isArray(itemsIncluded) ? itemsIncluded : (typeof itemsIncluded === 'string' ? itemsIncluded.split('\n').filter(Boolean) : []),
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    available: available !== undefined ? Boolean(available) : true,
    validUntil: validUntil || '2026-12-31',
    image: image || '/src/assets/images/combos_party_kit_1792974929979.jpg'
  };
  const saved = db.saveCombo(newCombo);
  res.status(201).json(saved);
});

apiRouter.put('/combos/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.getCombos().find(c => c.id === id);
  if (!existing) {
    return res.status(404).json({ error: 'Combo não encontrado.' });
  }
  const updated = db.saveCombo({
    ...existing,
    ...req.body,
    id,
    price: Number(req.body.price ?? existing.price),
    originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : existing.originalPrice
  });
  res.json(updated);
});

apiRouter.delete('/combos/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = db.deleteCombo(id);
  if (!ok) {
    return res.status(404).json({ error: 'Combo não encontrado.' });
  }
  res.json({ success: true, message: 'Combo removido com sucesso.' });
});

// ----------------- GALLERY -----------------
apiRouter.get('/gallery', (_req: Request, res: Response) => {
  res.json(db.getGallery());
});

apiRouter.post('/gallery', requireAdmin, (req: Request, res: Response) => {
  const { title, category, image, description } = req.body;
  if (!title || !image) {
    return res.status(400).json({ error: 'Título e URL de imagem são obrigatórios.' });
  }
  const newItem = {
    id: `gal-${Date.now()}`,
    title,
    category: category || 'ambiente',
    image,
    description: description || ''
  };
  const saved = db.saveGalleryItem(newItem);
  res.status(201).json(saved);
});

apiRouter.delete('/gallery/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = db.deleteGalleryItem(id);
  if (!ok) {
    return res.status(404).json({ error: 'Foto não encontrada.' });
  }
  res.json({ success: true, message: 'Foto removida com sucesso.' });
});

// ----------------- CUSTOMER PHOTOS (COMPARTILHE SUA RESENHA) -----------------
apiRouter.get('/customer-photos', (req: Request, res: Response) => {
  const onlyApproved = req.query.approvedOnly === 'true';
  res.json(db.getCustomerPhotos(onlyApproved));
});

apiRouter.post('/customer-photos', (req: Request, res: Response) => {
  const { customerName, photoUrl, caption } = req.body;
  if (!customerName || !photoUrl) {
    return res.status(400).json({ error: 'Nome e imagem são obrigatórios.' });
  }
  // Max length / payload sanity check
  if (photoUrl.length > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'A foto excede o limite permitido (máx 5MB).' });
  }

  const newPhoto = db.addCustomerPhoto({
    customerName: customerName.trim(),
    photoUrl,
    caption: caption ? caption.trim() : undefined,
  });

  res.status(201).json(newPhoto);
});

apiRouter.patch('/customer-photos/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (status !== 'aprovada' && status !== 'recusada') {
    return res.status(400).json({ error: 'Status deve ser "aprovada" ou "recusada".' });
  }

  const updated = db.updateCustomerPhotoStatus(id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Foto não encontrada.' });
  }
  res.json(updated);
});

apiRouter.delete('/customer-photos/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = db.deleteCustomerPhoto(id);
  if (!ok) {
    return res.status(404).json({ error: 'Foto não encontrada.' });
  }
  res.json({ success: true, message: 'Foto excluída com sucesso.' });
});

// ----------------- THEMES & EVENTS -----------------
apiRouter.get('/themes/active', (_req: Request, res: Response) => {
  res.json(db.getActiveTheme());
});

apiRouter.get('/themes', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getThemeEvents());
});

apiRouter.post('/themes', requireAdmin, (req: Request, res: Response) => {
  const { name, themeVisual, startDate, endDate, priority, bannerImage, message } = req.body;
  if (!name || !themeVisual || !startDate || !endDate) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome, tema visual, início e fim.' });
  }

  const newEvent = {
    id: `theme-${Date.now()}`,
    name,
    themeVisual,
    startDate,
    endDate,
    priority: Number(priority || 5),
    isManualActive: false,
    status: 'agendado' as const,
    bannerImage,
    message
  };

  const saved = db.saveThemeEvent(newEvent);
  res.status(201).json(saved);
});

apiRouter.put('/themes/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.getThemeEvents().find(t => t.id === id);
  if (!existing) {
    return res.status(404).json({ error: 'Evento de tema não encontrado.' });
  }
  const updated = db.saveThemeEvent({
    ...existing,
    ...req.body,
    id,
    priority: Number(req.body.priority ?? existing.priority)
  });
  res.json(updated);
});

apiRouter.delete('/themes/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = db.deleteThemeEvent(id);
  if (!ok) {
    return res.status(404).json({ error: 'Evento não encontrado.' });
  }
  res.json({ success: true, message: 'Evento excluído com sucesso.' });
});

apiRouter.post('/themes/override', requireAdmin, (req: Request, res: Response) => {
  const { override } = req.body;
  if (!['auto', 'padrao', 'halloween', 'neon', 'festa_roxa'].includes(override)) {
    return res.status(400).json({ error: 'Opção de override inválida.' });
  }
  db.updateSettings({ manualThemeOverride: override });
  res.json({ success: true, active: db.getActiveTheme() });
});

// ----------------- ORDERS & VALIDATION -----------------
apiRouter.get('/orders', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getOrders());
});

apiRouter.post('/orders', (req: Request, res: Response) => {
  const {
    customerName,
    customerPhone,
    deliveryType,
    address,
    paymentMethod,
    changeFor,
    items,
    notes
  } = req.body;

  if (!customerName || !customerPhone || !items || !items.length) {
    return res.status(400).json({ error: 'Dados do cliente e itens são obrigatórios para registrar o pedido.' });
  }

  // Server-side validation of combos and prices to prevent manipulation
  const allCombos = db.getCombos();
  let serverCalculatedSubtotal = 0;

  const validatedItems = items.map((item: any) => {
    let unitPrice = Number(item.unitPrice);

    // If it's a fixed combo, enforce server's registered fixed price
    if (item.type === 'combo' && item.comboDetails?.comboId) {
      const registeredCombo = allCombos.find(c => c.id === item.comboDetails.comboId);
      if (registeredCombo && registeredCombo.available) {
        unitPrice = registeredCombo.price;
      }
    }

    const qty = Math.max(1, Number(item.quantity) || 1);
    const itemTotal = unitPrice * qty;
    serverCalculatedSubtotal += itemTotal;

    return {
      type: item.type,
      productId: item.productId,
      name: item.name,
      quantity: qty,
      unitPrice,
      totalPrice: itemTotal,
      customDetails: item.customDetails,
      customRoshDetails: item.customRoshDetails,
      comboDetails: item.comboDetails
    };
  });

  const settings = db.getSettings();
  const deliveryFee = deliveryType === 'delivery' ? settings.deliveryFee : 0;
  const total = serverCalculatedSubtotal + deliveryFee;

  const initialStatus = paymentMethod === 'pix' ? 'pendente' : 'aguardando_pagamento_presencial';

  const createdOrder = db.createOrder({
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    deliveryType: deliveryType || 'delivery',
    address,
    paymentMethod: paymentMethod || 'pix',
    changeFor: changeFor ? Number(changeFor) : undefined,
    items: validatedItems,
    subtotal: serverCalculatedSubtotal,
    deliveryFee,
    total,
    status: initialStatus,
    notes: notes ? notes.trim() : undefined
  });

  res.status(201).json(createdOrder);
});

apiRouter.patch('/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Novo status é obrigatório.' });
  }

  const updated = db.updateOrderStatus(id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Pedido não encontrado.' });
  }
  res.json(updated);
});

apiRouter.delete('/orders/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = db.deleteOrder(id);
  if (!ok) {
    return res.status(404).json({ error: 'Pedido não encontrado.' });
  }
  res.json({ success: true, message: 'Pedido excluído com sucesso.' });
});
