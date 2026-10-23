import { SelectionModal } from '@/components/shared/SelectionModal';
import { useTheme } from '@/contexts/ThemeContext';
import type { FoodSearchResult } from '@/types/food';

interface DeleteFoodModalProps {
  visible: boolean;
  item: FoodSearchResult | null;
  onClose: () => void;
  onDelete: (item: FoodSearchResult) => void;
}

export function DeleteFoodModal({ visible, item, onClose, onDelete }: DeleteFoodModalProps) {
  const { theme } = useTheme();
  return (
    <SelectionModal
      visible={visible}
      title="Delete Food Item"
      description={item ? `Remove ${item.food.name} from your food library. Close the sheet to keep it.` : 'Remove this food item from your food library. Close the sheet to keep it.'}
      onClose={onClose}
      options={[
        {
          key: 'delete-food-item',
          title: 'Delete Food Item',
          description: 'This permanently removes the food item and cannot be undone.',
          icon: 'trash-outline',
          accentColor: theme.danger,
          onPress: () => { if (item) onDelete(item); },
        },
      ]}
    />
  );
}
