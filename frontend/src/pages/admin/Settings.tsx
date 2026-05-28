import { useState, useEffect } from 'react';
import { useCurrency } from '../../store/currency';
import { CURRENCY_PRESETS, type CurrencyConfig } from '../../utils/format';
import { getSettings, updateSettings, testNotification } from '../../api';
import type { NotificationSettings } from '../../types';

export default function Settings() {
  const { currency, setCurrency } = useCurrency();
  const [customSymbol, setCustomSymbol] = useState('');
  const [saved, setSaved] = useState(false);

  // Notification state
  const [notif, setNotif] = useState<NotificationSettings>({
    feishu_webhook_url: '',
    feishu_enabled: '',
    dingtalk_webhook_url: '',
    dingtalk_enabled: '',
  });
  const [notifLoading, setNotifLoading] = useState(true);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    getSettings()
      .then((res) => setNotif(res.data))
      .finally(() => setNotifLoading(false));
  }, []);

  // Currency handlers
  const handlePreset = (preset: CurrencyConfig) => {
    setCurrency(preset);
    setCustomSymbol('');
    showSaved();
  };

  const handleCustomSymbol = (symbol: string) => {
    setCustomSymbol(symbol);
    if (symbol) {
      setCurrency({ ...currency, symbol, code: 'CUSTOM' });
      showSaved();
    }
  };

  const handlePositionChange = (position: 'before' | 'after') => {
    setCurrency({ ...currency, position });
    showSaved();
  };

  const handleDecimalsChange = (decimals: number) => {
    setCurrency({ ...currency, decimals });
    showSaved();
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  // Notification handlers
  const handleNotifChange = (key: keyof NotificationSettings, value: string) => {
    setNotif((prev) => ({ ...prev, [key]: value }));
  };

  const handleNotifSave = async () => {
    try {
      await updateSettings(notif as unknown as Record<string, string>);
      setTestResult(null);
      showSaved();
    } catch {
      alert('保存失败');
    }
  };

  const handleTest = async () => {
    setTestSending(true);
    setTestResult(null);
    try {
      // Auto-save first so test uses latest settings
      await updateSettings(notif as unknown as Record<string, string>);
      const res = await testNotification();
      setTestResult({ ok: true, msg: res.data.message || '测试通知发送成功，请检查飞书/钉钉' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      const msg = axiosErr?.response?.data?.error || '发送失败，请检查 Webhook URL 和启用状态';
      setTestResult({ ok: false, msg });
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-warm-900 tracking-tight mb-6">系统设置</h1>

      {/* ===== Currency Settings ===== */}
      {/* Preset currencies */}
      <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-warm-800 mb-1">币种预设</h2>
        <p className="text-sm text-warm-400 mb-5">选择一个常用币种，或在下方自定义</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {CURRENCY_PRESETS.map((preset) => {
            const isActive =
              currency.code === preset.code &&
              currency.symbol === preset.symbol &&
              !customSymbol;
            return (
              <button
                key={preset.code}
                onClick={() => handlePreset(preset)}
                className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl text-sm ${
                  isActive
                    ? 'bg-warm-800 text-white'
                    : 'bg-warm-50 text-warm-600 border border-warm-200 hover:border-warm-300'
                }`}
              >
                <span className="text-lg">{preset.symbol}</span>
                <span className="text-xs font-medium">{preset.code}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom config */}
      <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-warm-800 mb-1">自定义币种</h2>
        <p className="text-sm text-warm-400 mb-5">输入任意符号作为币种标识</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-warm-600 mb-1.5">币种符号</label>
            <input
              value={customSymbol || (currency.code === 'CUSTOM' ? currency.symbol : '')}
              onChange={(e) => handleCustomSymbol(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-warm-200 text-sm bg-warm-50"
              placeholder="如 $、€、฿、₹"
              maxLength={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-600 mb-1.5">符号位置</label>
            <div className="flex gap-2">
              <button
                onClick={() => handlePositionChange('before')}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm ${
                  currency.position === 'before'
                    ? 'bg-warm-800 text-white'
                    : 'bg-warm-50 text-warm-500 border border-warm-200 hover:border-warm-300'
                }`}
              >
                前缀 ({currency.symbol}100)
              </button>
              <button
                onClick={() => handlePositionChange('after')}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm ${
                  currency.position === 'after'
                    ? 'bg-warm-800 text-white'
                    : 'bg-warm-50 text-warm-500 border border-warm-200 hover:border-warm-300'
                }`}
              >
                后缀 (100{currency.symbol})
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-600 mb-1.5">小数位数</label>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((d) => (
                <button
                  key={d}
                  onClick={() => handleDecimalsChange(d)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm ${
                    currency.decimals === d
                      ? 'bg-warm-800 text-white'
                      : 'bg-warm-50 text-warm-500 border border-warm-200 hover:border-warm-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Currency preview */}
      <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-8">
        <h2 className="text-base font-semibold text-warm-800 mb-4">币种预览</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: '菜品价格', amount: 28.5 },
            { label: '订单合计', amount: 156.00 },
            { label: '总收入', amount: 12580.75 },
          ].map((item) => {
            const formatted = currency.position === 'before'
              ? `${currency.symbol}${item.amount.toFixed(currency.decimals)}`
              : `${item.amount.toFixed(currency.decimals)}${currency.symbol}`;
            return (
              <div key={item.label} className="bg-warm-50 rounded-xl px-4 py-3">
                <p className="text-xs text-warm-400 mb-1">{item.label}</p>
                <p className="text-lg font-semibold text-accent-600">{formatted}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Notification Settings ===== */}
      <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-warm-800 mb-1">通知设置</h2>
        <p className="text-sm text-warm-400 mb-6">配置飞书/钉钉机器人 Webhook，新订单时自动通知</p>

        {notifLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-warm-200 border-t-accent-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Feishu */}
            <div className="bg-warm-50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-warm-700">飞书机器人</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notif.feishu_enabled === 'true'}
                    onChange={(e) => handleNotifChange('feishu_enabled', e.target.checked ? 'true' : 'false')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-warm-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-500" />
                </label>
              </div>
              <input
                value={notif.feishu_webhook_url}
                onChange={(e) => handleNotifChange('feishu_webhook_url', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-200 text-sm bg-white placeholder:text-warm-300"
                placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."
              />
            </div>

            {/* DingTalk */}
            <div className="bg-warm-50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-warm-700">钉钉机器人</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notif.dingtalk_enabled === 'true'}
                    onChange={(e) => handleNotifChange('dingtalk_enabled', e.target.checked ? 'true' : 'false')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-warm-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-500" />
                </label>
              </div>
              <input
                value={notif.dingtalk_webhook_url}
                onChange={(e) => handleNotifChange('dingtalk_webhook_url', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-200 text-sm bg-white placeholder:text-warm-300"
                placeholder="https://oapi.dingtalk.com/robot/send?access_token=..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleNotifSave}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-warm-800 text-white hover:bg-warm-700"
              >
                保存通知设置
              </button>
              <button
                onClick={handleTest}
                disabled={testSending}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-accent-600 bg-accent-50 hover:bg-accent-100 disabled:opacity-40"
              >
                {testSending ? '发送中...' : '保存并测试'}
              </button>
            </div>

            {testResult && (
              <p className={`text-sm ${testResult.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                {testResult.msg}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Global saved indicator */}
      {saved && (
        <p className="text-sm text-emerald-600 text-center mt-4">已保存</p>
      )}
    </div>
  );
}
