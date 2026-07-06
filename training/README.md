# LoRA Training

Trains the `inkwb` LoRA on the [ink dataset](../ink_dataset/README.md), reusing the pipeline from [The-Latent-Mycelium](https://github.com/Yeri10/The-Latent-Mycelium) (SD 1.5 + diffusers LoRA, tested on Apple Silicon / MPS).

## Files

| File | Purpose |
|---|---|
| `Inkward Bound LoRA Training.ipynb` | End-to-end training notebook (same format as the Mycelium one): Environment Setup → Hardware Check → Dataset Validation → Training Configuration → Start Training → Inference Test → Result Packaging |
| `prepare_dataset.py` | Converts `ink_dataset/` (per-image `.txt` captions) into `training/dataset/` (resized images + `metadata.jsonl`, diffusers format) |
| `train_text_to_image_lora.py` | Official diffusers LoRA training script; the notebook re-downloads the version matching the installed diffusers, this copy is the offline fallback |
| `dataset/` | Generated training data, not committed to git (re-run `prepare_dataset.py` after caption changes) |
| `runs/` | Training outputs (weights, checkpoints, logs) |

## Environment

Use the `ml-art` conda environment from The-Latent-Mycelium (`environment.yml` there):

```bash
conda activate ml-art
```

## Steps

1. Prepare the dataset (re-run whenever captions change):

   ```bash
   python3 training/prepare_dataset.py
   ```

2. Launch training from the repository root:

   ```bash
   accelerate launch training/train_text_to_image_lora.py \
     --pretrained_model_name_or_path runwayml/stable-diffusion-v1-5 \
     --train_data_dir training/dataset \
     --resolution 512 --center_crop \
     --train_batch_size 1 --gradient_accumulation_steps 4 \
     --num_train_epochs 12 --learning_rate 5e-5 \
     --lr_scheduler constant --lr_warmup_steps 0 \
     --rank 16 --seed 42 \
     --checkpointing_steps 100 \
     --validation_prompt "inkwb, black ink gathering and condensing in water, final phase of gathering, side view, a dense black mound with a twisting tendril column above, monochrome, high contrast" \
     --validation_epochs 2 --num_validation_images 2 \
     --report_to tensorboard \
     --output_dir training/runs/inkwb_lora_v1
   ```

   Do not add `--random_flip`: captions encode left/right positions.

3. Test the weights (`training/runs/inkwb_lora_v1/pytorch_lora_weights.safetensors`) by loading them with `StableDiffusionPipeline.load_lora_weights`, then sweep the caption vocabulary: state phrase × phase phrase × viewpoint (see [ink_dataset README](../ink_dataset/README.md) for the c-value mapping).

## Evaluation checklist

- Does `inkwb` reproduce the monochrome ink-in-water look?
- Do the four state phrases produce distinct morphologies?
- Do `early → final phase` prompts move along a plausible temporal axis?
- Do `top-down view` / `side view` switch the camera angle?

Once these hold, batch-generate the pre-baked latent atlas along the c-value grid and replace the placeholder images in the TouchDesigner atlas folders.
