import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { ItineraryModule } from './modules/itinerary/itinerary.module';
import { AppController } from './app.controller';

@Module({
  imports: [
   CommonModule,
   AuthModule,
   ItineraryModule
  ],
  controllers: [AppController],
})
export class AppModule {}
