import React from 'react';
import type { AllSettings } from '../types';
import { printerPresets, materialPresets } from '../presets';

interface PrintSectionProps {
  settings: AllSettings['print'];
  materialId: string;
  onUpdate: (updates: Partial<AllSettings['print']>) => void;
}

export const PrintSection: React.FC<PrintSectionProps> = ({
  settings,
  materialId,
  onUpdate,
}) => {
  const handlePrinterChange = (printerId: string) => {
    const preset = printerPresets.find((p) => p.id === printerId);
    if (preset) {
      let watts = preset.printingWatts;
      
      // Se for Prusa MK4S, usar variante do material
      if (preset.hasMaterialVariant && preset.materialVariants) {
        const material = materialPresets.find((m) => m.id === materialId);
        if (material) {
          const materialName = material.name.toUpperCase();
          if (materialName.includes('ABS') || materialName.includes('ASA')) {
            watts = preset.materialVariants['ABS'] || preset.printingWatts;
          } else {
            watts = preset.materialVariants['PLA'] || preset.printingWatts;
          }
        }
      }
      
      onUpdate({
        printerId,
        printingWatts: watts,
        idleWatts: preset.idleWatts,
      });
    }
  };

  const selectedPrinter = printerPresets.find((p) => p.id === settings.printerId);

  return (
    <div className="card">
      <h2>🖨️ Impressão</h2>
      
      <div className="form-group">
        <label htmlFor="printer">Impressora</label>
        <select
          id="printer"
          value={settings.printerId}
          onChange={(e) => handlePrinterChange(e.target.value)}
        >
          {printerPresets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
      </div>

      {selectedPrinter?.hasMaterialVariant && (
        <div className="info-box">
          ℹ️ Potência ajustada automaticamente pelo material selecionado
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="printingWatts">
            Potência (W)
            <span className="tooltip" title="Potência média durante impressão">ⓘ</span>
          </label>
          <input
            id="printingWatts"
            type="number"
            min="0"
            value={settings.printingWatts}
            onChange={(e) => onUpdate({ printingWatts: Math.max(0, Number(e.target.value)) })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="idleWatts">
            Idle (W)
            <span className="tooltip" title="Consumo em standby (opcional)">ⓘ</span>
          </label>
          <input
            id="idleWatts"
            type="number"
            min="0"
            value={settings.idleWatts}
            onChange={(e) => onUpdate({ idleWatts: Math.max(0, Number(e.target.value)) })}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Tempo de Impressão</label>
        <div className="time-input">
          <input
            type="number"
            min="0"
            placeholder="hh"
            value={settings.printTimeHours || ''}
            onChange={(e) => onUpdate({ printTimeHours: Math.max(0, Number(e.target.value)) })}
          />
          <span>h</span>
          <input
            type="number"
            min="0"
            max="59"
            placeholder="mm"
            value={settings.printTimeMinutes || ''}
            onChange={(e) => onUpdate({ printTimeMinutes: Math.min(59, Math.max(0, Number(e.target.value))) })}
          />
          <span>min</span>
        </div>
      </div>
    </div>
  );
};
